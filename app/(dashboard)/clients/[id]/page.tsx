import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatDateTime, maskEmail, formatReceiptId } from '@/lib/format'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      receipts: {
        include: {
          store: true,
          lineItems: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      loyaltyAccount: {
        include: {
          tier: true,
          program: true,
        },
      },
    },
  })

  if (!customer) return null

  const receipts = customer.receipts
  const totalSpend = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0)

  // Top categories
  const categoryCounts = new Map<string, number>()
  receipts.forEach((r) => {
    r.lineItems.forEach((item) => {
      categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1)
    })
  })
  const topCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category]) => category)

  // Main store (most visited)
  const storeCounts = new Map<string, number>()
  receipts.forEach((r) => {
    storeCounts.set(r.storeId, (storeCounts.get(r.storeId) || 0) + 1)
  })
  const mainStoreId =
    storeCounts.size > 0
      ? Array.from(storeCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : null
  const mainStore = mainStoreId
    ? await prisma.store.findUnique({ where: { id: mainStoreId } })
    : null

  // Frequency
  const visits = receipts.length
  const firstReceipt = receipts.length > 0 ? receipts[receipts.length - 1] : null
  const lastReceipt = receipts.length > 0 ? receipts[0] : null
  const daysDiff =
    firstReceipt && lastReceipt
      ? Math.ceil((lastReceipt.createdAt.getTime() - firstReceipt.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0
  const avgDaysBetweenVisits = visits > 1 && daysDiff > 0 ? daysDiff / (visits - 1) : 0

  // Segments
  const segments: string[] = []
  if (avgDaysBetweenVisits < 30 && visits >= 3) segments.push('Petits paniers récurrents')
  if (totalSpend > 500 && visits < 5) segments.push('Gros paniers occasionnels')
  if (lastReceipt) {
    const daysSinceLastVisit = Math.ceil(
      (Date.now() - lastReceipt.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceLastVisit > 40) segments.push('Inactifs 40j+')
  }
  if (topCategories.length >= 3) segments.push('Explorateurs multi-catégories')

  return {
    ...customer,
    stats: {
      totalSpend,
      visits,
      topCategories,
      mainStore: mainStore?.name || null,
      avgDaysBetweenVisits,
      segments,
    },
  }
}

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const customer = await getCustomer(params.id)

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          {customer.firstName} {customer.lastName}
        </h1>
        <p className="text-muted-foreground mt-2">
          Profil et historique du client
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Nom</div>
              <div className="font-medium">
                {customer.firstName} {customer.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{maskEmail(customer.email)}</div>
            </div>
            {customer.stats.mainStore && (
              <div>
                <div className="text-sm text-muted-foreground">Magasin principal</div>
                <div className="font-medium">{customer.stats.mainStore}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Membre depuis</div>
              <div className="font-medium">{formatDate(customer.createdAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Account */}
      {customer.loyaltyAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Fidélité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-sm text-muted-foreground">Niveau</div>
                <div className="mt-1">
                  <Badge
                    variant={
                      customer.loyaltyAccount.tier?.name === 'Or'
                        ? 'warning'
                        : customer.loyaltyAccount.tier?.name === 'Argent'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {customer.loyaltyAccount.tier?.name || 'Non classé'}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Points</div>
                <div className="text-2xl font-bold">{customer.loyaltyAccount.points}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total dépensé</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(customer.loyaltyAccount.totalSpend)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Dernière activité</div>
                <div className="font-medium">
                  {customer.loyaltyAccount.lastActivity
                    ? formatDate(customer.loyaltyAccount.lastActivity)
                    : '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total dépensé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(customer.stats.totalSpend)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de visites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.stats.visits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fréquence moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customer.stats.avgDaysBetweenVisits > 0
                ? `${customer.stats.avgDaysBetweenVisits.toFixed(0)} jours`
                : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customer.stats.visits > 0
                ? formatCurrency(customer.stats.totalSpend / customer.stats.visits)
                : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segments */}
      {customer.stats.segments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Segments</CardTitle>
            <CardDescription>Classification du client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {customer.stats.segments.map((segment) => (
                <Badge key={segment} variant="outline">
                  {segment}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Categories */}
      {customer.stats.topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Catégories principales</CardTitle>
            <CardDescription>Catégories les plus achetées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {customer.stats.topCategories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipts Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des tickets</CardTitle>
          <CardDescription>Derniers tickets du client</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Magasin</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.receipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aucun ticket
                  </TableCell>
                </TableRow>
              ) : (
                customer.receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-mono font-medium">
                      {formatReceiptId(receipt.id)}
                    </TableCell>
                    <TableCell>{receipt.store.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(receipt.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(receipt.totalAmount))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/tickets/${receipt.id}`}>
                        <Button variant="ghost" size="sm">
                          Voir
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

