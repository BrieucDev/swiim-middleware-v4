import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/format'
import { getLoyaltyStats } from '@/lib/analytics/loyalty'
import { LoyaltyProgramEditor } from '@/components/fidelite/LoyaltyProgramEditor'
import { CampaignCreator } from '@/components/fidelite/CampaignCreator'
import { ImpactSimulator } from '@/components/fidelite/ImpactSimulator'
import { Pencil } from 'lucide-react'

async function getTopLoyalCustomers() {
  const accounts = await prisma.loyaltyAccount.findMany({
    include: {
      customer: {
        include: {
          receipts: {
            include: {
              lineItems: true,
            },
          },
        },
      },
      tier: true,
    },
    orderBy: {
      totalSpend: 'desc',
    },
    take: 10,
  })

  return accounts.map((account) => {
    const receipts = account.customer.receipts
    const visits = receipts.length

    // Calculate frequency
    const firstReceipt = receipts.length > 0 ? receipts[receipts.length - 1] : null
    const lastReceipt = receipts.length > 0 ? receipts[0] : null
    const daysDiff =
      firstReceipt && lastReceipt
        ? Math.ceil((lastReceipt.createdAt.getTime() - firstReceipt.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0
    const avgFrequency = visits > 1 && daysDiff > 0 ? daysDiff / (visits - 1) : 0

    // Top categories
    const categoryCounts = new Map<string, number>()
    receipts.forEach((r) => {
      r.lineItems.forEach((item) => {
        categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1)
      })
    })
    const topCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category)

    return {
      id: account.customer.id,
      name: `${account.customer.firstName} ${account.customer.lastName}`,
      email: account.customer.email,
      tier: account.tier?.name || 'Non classé',
      points: account.points,
      totalSpend: account.totalSpend,
      frequency: avgFrequency,
      topCategories,
    }
  })
}

async function getCampaigns() {
  return await prisma.loyaltyCampaign.findMany({
    include: {
      program: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export default async function FidelitePage() {
  const stats = await getLoyaltyStats()
  const topCustomers = await getTopLoyalCustomers()
  const campaigns = await getCampaigns()

  if (!stats) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Fidélité</h1>
          <p className="text-muted-foreground mt-2">
            Aucun programme de fidélité configuré
          </p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning'> = {
      TERMINEE: 'success',
      PROGRAMMEE: 'warning',
      BROUILLON: 'default',
    }
    return variants[status] || 'default'
  }

  const getChannelBadge = (channel: string) => {
    const variants: Record<string, 'default' | 'secondary'> = {
      EMAIL: 'default',
      PUSH: 'secondary',
      INAPP: 'secondary',
    }
    return variants[channel] || 'default'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Fidélité</h1>
        <p className="text-muted-foreground mt-2">
          Gestion du programme de fidélité et campagnes
        </p>
      </div>

      {/* Overview KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString('fr-FR')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Membres actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points en circulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pointsInCirculation.toLocaleString('fr-FR')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Points non utilisés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d&apos;engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.engagementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Activité 60 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA généré (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.loyaltyRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Clients fidélisés
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="program">Règles du programme</TabsTrigger>
          <TabsTrigger value="tiers">Niveaux de fidélité</TabsTrigger>
          <TabsTrigger value="customers">Top clients</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="simulator">Simulateur</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribution des niveaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.tierDistribution.map((tier) => (
                    <div key={tier.tier} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{tier.tier}</div>
                        <div className="text-sm text-muted-foreground">
                          {tier.count} membres
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{
                            width: `${(tier.count / stats.totalMembers) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points totaux</span>
                  <span className="font-medium">{stats.totalPoints.toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points utilisés</span>
                  <span className="font-medium">{stats.pointsUsed.toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total dépensé</span>
                  <span className="font-medium">{formatCurrency(stats.program.accounts.reduce((sum, a) => sum + a.totalSpend, 0))}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="program" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Règles du programme</CardTitle>
                  <CardDescription>{stats.program.name}</CardDescription>
                </div>
                <LoyaltyProgramEditor program={stats.program} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">Points par euro</div>
                  <div className="text-2xl font-bold">{stats.program.pointsPerEuro} point</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Conversion</div>
                  <div className="text-2xl font-bold">
                    {stats.program.conversionRate} points = {formatCurrency(stats.program.conversionValue)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Bonus catégories</div>
                  <div className="mt-1">
                    {stats.program.bonusCategories ? (
                      Object.entries(stats.program.bonusCategories as Record<string, number>).map(([cat, mult]) => (
                        <Badge key={cat} variant="outline" className="mr-2">
                          {cat}: x{mult}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Aucun</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Expiration des points</div>
                  <div className="text-lg font-medium">
                    {stats.program.pointsExpiryDays ? `${stats.program.pointsExpiryDays / 30} mois` : 'Aucune'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {stats.tierDistribution.map((tierInfo) => {
              const tier = stats.program.tiers.find(t => t.name === tierInfo.tier)
              if (!tier) return null

              const benefits = tier.benefits as Record<string, any> || {}

              return (
                <Card key={tier.id}>
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription>
                      {formatCurrency(tier.minSpend)}
                      {tier.maxSpend && ` - ${formatCurrency(tier.maxSpend)}`}
                      {!tier.maxSpend && '+'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Membres</div>
                      <div className="text-2xl font-bold">{tierInfo.count}</div>
                    </div>
                    {Object.keys(benefits).length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Avantages</div>
                        <ul className="text-sm space-y-1">
                          {Object.entries(benefits).map(([key, value]) => (
                            <li key={key} className="text-muted-foreground">
                              • {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top clients fidèles</CardTitle>
              <CardDescription>Clients les plus engagés</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Total dépensé</TableHead>
                    <TableHead className="text-right">Fréquence</TableHead>
                    <TableHead>Catégories</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {customer.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.tier === 'Or' ? 'warning' : customer.tier === 'Argent' ? 'default' : 'secondary'}>
                          {customer.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {customer.points.toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(customer.totalSpend)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {customer.frequency > 0 ? `${customer.frequency.toFixed(0)} jours` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {customer.topCategories.map((cat) => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Campagnes</h2>
              <p className="text-muted-foreground">
                Gestion des campagnes marketing et promotions
              </p>
            </div>
            <CampaignCreator programId={stats.program.id} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste des campagnes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Ouverture</TableHead>
                    <TableHead className="text-right">Conversion</TableHead>
                    <TableHead className="text-right">CA généré</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Aucune campagne
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaigns.map((campaign) => {
                      const stats = campaign.stats as any || {}
                      const sent = stats.sent || 0
                      const opened = stats.opened || 0
                      const clicked = stats.clicked || 0
                      const conversions = stats.conversions || 0
                      const openRate = sent > 0 ? (opened / sent) * 100 : 0
                      const conversionRate = sent > 0 ? (conversions / sent) * 100 : 0

                      return (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{campaign.targetSegment}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getChannelBadge(campaign.channel)}>
                              {campaign.channel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {openRate.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {conversionRate.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(stats.extraRevenue || 0)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-4">
          <ImpactSimulator programId={stats.program.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

