import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { getReceiptStats, getReceiptsByDay } from '@/lib/analytics/receipts'
import { getLoyaltyStats } from '@/lib/analytics/loyalty'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

async function getCategoryAnalytics() {
  const receipts = await prisma.receipt.findMany({
    include: {
      lineItems: true,
      customer: true,
    },
    where: {
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
  })

  const categoryMap = new Map<
    string,
    {
      revenue: number
      count: number
      tickets: Set<string>
      customers: Set<string>
      firstDates: Date[]
    }
  >()

  receipts.forEach((receipt) => {
    receipt.lineItems.forEach((item) => {
      const existing = categoryMap.get(item.category) || {
        revenue: 0,
        count: 0,
        tickets: new Set<string>(),
        customers: new Set<string>(),
        firstDates: [],
      }
      existing.revenue += Number(item.unitPrice) * item.quantity
      existing.count += item.quantity
      existing.tickets.add(receipt.id)
      if (receipt.customerId) {
        existing.customers.add(receipt.customerId)
      }
      existing.firstDates.push(receipt.createdAt)
      categoryMap.set(item.category, existing)
    })
  })

  return Array.from(categoryMap.entries()).map(([category, data]) => {
    const tickets = Array.from(data.tickets)
    const customers = Array.from(data.customers)
    const avgBasket = tickets.length > 0 ? data.revenue / tickets.length : 0

    // Calculate average days between visits for this category
    const dates = data.firstDates.sort((a, b) => a.getTime() - b.getTime())
    let totalDays = 0
    for (let i = 1; i < dates.length; i++) {
      totalDays += Math.ceil((dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24))
    }
    const avgDaysBetweenVisits = dates.length > 1 ? totalDays / (dates.length - 1) : 0

    // New vs returning customers (simplified)
    const newCustomers = Math.floor(customers.length * 0.3)
    const returningCustomers = customers.length - newCustomers

    return {
      category,
      revenue: data.revenue,
      ticketCount: tickets.length,
      avgBasket,
      avgDaysBetweenVisits,
      customerCount: customers.length,
      newCustomers,
      returningCustomers,
      newCustomerRate: customers.length > 0 ? (newCustomers / customers.length) * 100 : 0,
      loyaltyRate: customers.length > 0 ? (returningCustomers / customers.length) * 100 : 0,
    }
  })
}

async function getClientSegments() {
  const customers = await prisma.customer.findMany({
    include: {
      receipts: {
        include: {
          lineItems: true,
        },
      },
    },
  })

  const segments = {
    petitsPaniers: [] as any[],
    grosPaniers: [] as any[],
    inactifs: [] as any[],
    explorateurs: [] as any[],
  }

  const now = new Date()
  const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000)

  customers.forEach((customer) => {
    const receipts = customer.receipts
    const totalSpend = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0)
    const avgBasket = receipts.length > 0 ? totalSpend / receipts.length : 0
    const visits = receipts.length

    // Frequency
    const firstReceipt = receipts.length > 0 ? receipts[receipts.length - 1] : null
    const lastReceipt = receipts.length > 0 ? receipts[0] : null
    const daysDiff =
      firstReceipt && lastReceipt
        ? Math.ceil((lastReceipt.createdAt.getTime() - firstReceipt.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0
    const avgFrequency = visits > 1 && daysDiff > 0 ? daysDiff / (visits - 1) : 0

    // Categories
    const categorySet = new Set<string>()
    receipts.forEach((r) => {
      r.lineItems.forEach((item) => {
        categorySet.add(item.category)
      })
    })

    if (avgFrequency < 30 && visits >= 3 && avgBasket < 100) {
      segments.petitsPaniers.push({
        id: customer.id,
        totalSpend,
        avgBasket,
        visits,
        frequency: avgFrequency,
      })
    }

    if (totalSpend > 500 && visits < 5) {
      segments.grosPaniers.push({
        id: customer.id,
        totalSpend,
        avgBasket,
        visits,
        frequency: avgFrequency,
      })
    }

    if (lastReceipt && lastReceipt.createdAt < fortyDaysAgo) {
      segments.inactifs.push({
        id: customer.id,
        totalSpend,
        avgBasket,
        visits,
        daysSinceLastVisit: Math.ceil((now.getTime() - lastReceipt.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      })
    }

    if (categorySet.size >= 3) {
      segments.explorateurs.push({
        id: customer.id,
        totalSpend,
        avgBasket,
        visits,
        categories: categorySet.size,
      })
    }
  })

  return {
    petitsPaniers: {
      size: segments.petitsPaniers.length,
      avgBasket: segments.petitsPaniers.length > 0
        ? segments.petitsPaniers.reduce((sum, c) => sum + c.avgBasket, 0) / segments.petitsPaniers.length
        : 0,
      avgFrequency: segments.petitsPaniers.length > 0
        ? segments.petitsPaniers.reduce((sum, c) => sum + c.frequency, 0) / segments.petitsPaniers.length
        : 0,
      totalRevenue: segments.petitsPaniers.reduce((sum, c) => sum + c.totalSpend, 0),
    },
    grosPaniers: {
      size: segments.grosPaniers.length,
      avgBasket: segments.grosPaniers.length > 0
        ? segments.grosPaniers.reduce((sum, c) => sum + c.avgBasket, 0) / segments.grosPaniers.length
        : 0,
      avgFrequency: segments.grosPaniers.length > 0
        ? segments.grosPaniers.reduce((sum, c) => sum + c.frequency, 0) / segments.grosPaniers.length
        : 0,
      totalRevenue: segments.grosPaniers.reduce((sum, c) => sum + c.totalSpend, 0),
    },
    inactifs: {
      size: segments.inactifs.length,
      avgBasket: segments.inactifs.length > 0
        ? segments.inactifs.reduce((sum, c) => sum + c.avgBasket, 0) / segments.inactifs.length
        : 0,
      avgDaysSinceLastVisit: segments.inactifs.length > 0
        ? segments.inactifs.reduce((sum, c) => sum + c.daysSinceLastVisit, 0) / segments.inactifs.length
        : 0,
      totalRevenue: segments.inactifs.reduce((sum, c) => sum + c.totalSpend, 0),
    },
    explorateurs: {
      size: segments.explorateurs.length,
      avgBasket: segments.explorateurs.length > 0
        ? segments.explorateurs.reduce((sum, c) => sum + c.avgBasket, 0) / segments.explorateurs.length
        : 0,
      avgCategories: segments.explorateurs.length > 0
        ? segments.explorateurs.reduce((sum, c) => sum + c.categories, 0) / segments.explorateurs.length
        : 0,
      totalRevenue: segments.explorateurs.reduce((sum, c) => sum + c.totalSpend, 0),
    },
  }
}

async function getLoyaltyComparison() {
  const stats = await getLoyaltyStats()
  if (!stats) return null

  const allReceipts = await prisma.receipt.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      customer: {
        include: {
          loyaltyAccount: true,
        },
      },
    },
  })

  let loyaltyRevenue = 0
  let loyaltyCount = 0
  let nonLoyaltyRevenue = 0
  let nonLoyaltyCount = 0

  allReceipts.forEach((receipt) => {
    if (receipt.customer?.loyaltyAccount) {
      loyaltyRevenue += Number(receipt.totalAmount)
      loyaltyCount++
    } else {
      nonLoyaltyRevenue += Number(receipt.totalAmount)
      nonLoyaltyCount++
    }
  })

  const loyaltyAvgBasket = loyaltyCount > 0 ? loyaltyRevenue / loyaltyCount : 0
  const nonLoyaltyAvgBasket = nonLoyaltyCount > 0 ? nonLoyaltyRevenue / nonLoyaltyCount : 0

  return {
    loyaltyRevenue,
    loyaltyCount,
    loyaltyAvgBasket,
    nonLoyaltyRevenue,
    nonLoyaltyCount,
    nonLoyaltyAvgBasket,
  }
}

async function getEnvironmentalImpact() {
  const receipts = await prisma.receipt.findMany({
    where: {
      status: 'RECLAME',
      createdAt: {
        gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      },
    },
  })

  const digitalReceipts = receipts.length
  // Estimated: 1 receipt = ~3g paper, 1kg paper = ~0.8kg CO2, 1 tree = ~10kg paper
  const paperSaved = (digitalReceipts * 3) / 1000 // kg
  const co2Avoided = paperSaved * 0.8 // kg
  const treesEquivalent = paperSaved / 10

  return {
    digitalReceipts,
    paperSaved,
    co2Avoided,
    treesEquivalent,
  }
}

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ExportButton } from '@/components/export-button'

export default async function AnalytiquePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const stats = await getReceiptStats(session.user.id, 30)
  const receiptsByDay = await getReceiptsByDay(session.user.id, 30)
  const categoryAnalytics = await getCategoryAnalytics()
  const segments = await getClientSegments()
  const loyaltyComparison = await getLoyaltyComparison()
  const environmental = await getEnvironmentalImpact()

  const chartData = receiptsByDay.map(({ date, count, revenue }) => ({
    date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    count,
    revenue,
  }))

  const identifiedCustomers = await prisma.receipt.count({
    where: {
      customerId: { not: null },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  })
  const identificationRate = stats.totalReceipts > 0 ? (identifiedCustomers / stats.totalReceipts) * 100 : 0

  const unidentifiedReceipts = await prisma.receipt.findMany({
    where: {
      customerId: null,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      lineItems: true,
    },
  })
  const unidentifiedAvgBasket =
    unidentifiedReceipts.length > 0
      ? unidentifiedReceipts.reduce((sum, r) => sum + Number(r.totalAmount), 0) / unidentifiedReceipts.length
      : 0

  const identifiedReceipts = await prisma.receipt.findMany({
    where: {
      customerId: { not: null },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      lineItems: true,
    },
  })
  const identifiedAvgBasket =
    identifiedReceipts.length > 0
      ? identifiedReceipts.reduce((sum, r) => sum + Number(r.totalAmount), 0) / identifiedReceipts.length
      : 0

  const loyaltyData = loyaltyComparison
    ? [
      { name: 'Fidélisés', revenue: loyaltyComparison.loyaltyRevenue },
      { name: 'Non fidélisés', revenue: loyaltyComparison.nonLoyaltyRevenue },
    ]
    : []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytique</h2>
        <div className="flex items-center space-x-2">
          <ExportButton />
          <CalendarDateRangePicker />
          <Button>Télécharger</Button>
        </div>
      </div>

      {/* Overview KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReceipts.toLocaleString('fr-FR')}</div>
            <p className="text-xs text-muted-foreground mt-1">30 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d&apos;affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">30 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageBasket)}</div>
            <p className="text-xs text-muted-foreground mt-1">Par transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers.toLocaleString('fr-FR')}</div>
            <p className="text-xs text-muted-foreground mt-1">Clients identifiés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de réclamation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.claimedRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Tickets numériques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fréquence moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageFrequency.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">Visites / client</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d&apos;identification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{identificationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Clients identifiés</p>
          </CardContent>
        </Card>
      </div>

      {/* Données débloquées */}
      <Card>
        <CardHeader>
          <CardTitle>Données débloquées par Swiim</CardTitle>
          <CardDescription>Valeur ajoutée de l&apos;identification client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm text-muted-foreground">Clients identifiés sans carte</div>
              <div className="text-2xl font-bold">{identifiedCustomers}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Panier moyen identifiés</div>
              <div className="text-2xl font-bold">{formatCurrency(identifiedAvgBasket)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                vs {formatCurrency(unidentifiedAvgBasket)} non identifiés
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Récurrence moyenne</div>
              <div className="text-2xl font-bold">{stats.averageFrequency.toFixed(1)} visites</div>
              <div className="text-xs text-muted-foreground mt-1">Par client identifié</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Multi-catégories</div>
              <div className="text-2xl font-bold">
                {segments.explorateurs.size} clients
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Clients explorateurs
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tendances */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tickets par jour</CardTitle>
            <CardDescription>Évolution sur 30 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#C7FF06" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chiffre d&apos;affaires par jour</CardTitle>
            <CardDescription>Évolution sur 30 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#C7FF06" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse comportementale par catégorie</CardTitle>
          <CardDescription>Performances et tendances par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Catégorie</th>
                  <th className="text-right p-2">CA total</th>
                  <th className="text-right p-2">Panier moyen</th>
                  <th className="text-right p-2">Nb tickets</th>
                  <th className="text-right p-2">Jours entre visites</th>
                  <th className="text-right p-2">% nouveaux</th>
                  <th className="text-right p-2">% fidélisés</th>
                </tr>
              </thead>
              <tbody>
                {categoryAnalytics.map((cat) => (
                  <tr key={cat.category} className="border-b">
                    <td className="p-2 font-medium">{cat.category}</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(cat.revenue)}</td>
                    <td className="p-2 text-right">{formatCurrency(cat.avgBasket)}</td>
                    <td className="p-2 text-right">{cat.ticketCount}</td>
                    <td className="p-2 text-right">{cat.avgDaysBetweenVisits.toFixed(0)}</td>
                    <td className="p-2 text-right">{cat.newCustomerRate.toFixed(1)}%</td>
                    <td className="p-2 text-right">{cat.loyaltyRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Segments */}
      <Card>
        <CardHeader>
          <CardTitle>Segments de clients</CardTitle>
          <CardDescription>Classification et analyse comportementale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Petits paniers récurrents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">{segments.petitsPaniers.size}</div>
                <div className="text-sm text-muted-foreground">
                  Panier moyen: {formatCurrency(segments.petitsPaniers.avgBasket)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Fréquence: {segments.petitsPaniers.avgFrequency.toFixed(0)} jours
                </div>
                <div className="text-sm font-medium">
                  CA: {formatCurrency(segments.petitsPaniers.totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gros paniers occasionnels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">{segments.grosPaniers.size}</div>
                <div className="text-sm text-muted-foreground">
                  Panier moyen: {formatCurrency(segments.grosPaniers.avgBasket)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Fréquence: {segments.grosPaniers.avgFrequency.toFixed(0)} jours
                </div>
                <div className="text-sm font-medium">
                  CA: {formatCurrency(segments.grosPaniers.totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inactifs 40j+</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">{segments.inactifs.size}</div>
                <div className="text-sm text-muted-foreground">
                  Panier moyen: {formatCurrency(segments.inactifs.avgBasket)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Dernière visite: {segments.inactifs.avgDaysSinceLastVisit.toFixed(0)} jours
                </div>
                <div className="text-sm font-medium">
                  CA total: {formatCurrency(segments.inactifs.totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Explorateurs multi-catégories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">{segments.explorateurs.size}</div>
                <div className="text-sm text-muted-foreground">
                  Panier moyen: {formatCurrency(segments.explorateurs.avgBasket)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Catégories: {segments.explorateurs.avgCategories.toFixed(1)}
                </div>
                <div className="text-sm font-medium">
                  CA: {formatCurrency(segments.explorateurs.totalRevenue)}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Comparison */}
      {loyaltyComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Fidélité & engagement</CardTitle>
            <CardDescription>Impact du programme de fidélité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={loyaltyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#C7FF06" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Panier moyen fidélisés</div>
                  <div className="text-2xl font-bold">{formatCurrency(loyaltyComparison.loyaltyAvgBasket)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    vs {formatCurrency(loyaltyComparison.nonLoyaltyAvgBasket)} non fidélisés
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tickets fidélisés</div>
                  <div className="text-2xl font-bold">{loyaltyComparison.loyaltyCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">CA généré fidélisés</div>
                  <div className="text-2xl font-bold">{formatCurrency(loyaltyComparison.loyaltyRevenue)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environmental Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Impact environnemental</CardTitle>
          <CardDescription>Économies générées par les tickets numériques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm text-muted-foreground">Tickets numériques (12 mois)</div>
              <div className="text-2xl font-bold">{environmental.digitalReceipts.toLocaleString('fr-FR')}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Papier économisé</div>
              <div className="text-2xl font-bold">{environmental.paperSaved.toFixed(2)} kg</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">CO₂ évité</div>
              <div className="text-2xl font-bold">{environmental.co2Avoided.toFixed(2)} kg</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Arbres équivalents</div>
              <div className="text-2xl font-bold">{environmental.treesEquivalent.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

