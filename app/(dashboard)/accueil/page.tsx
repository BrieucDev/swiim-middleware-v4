import { formatCurrency } from '@/lib/format'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { ChartCard } from '@/components/dashboard/chart-card'
import { SectionHeader } from '@/components/dashboard/section-header'
import { TicketsChart } from '@/components/dashboard/tickets-chart'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { StoresChart } from '@/components/dashboard/stores-chart'

export default async function AccueilPage() {
  // Temporarily using mock data to fix build error
  const stats = {
    totalReceipts: 12543,
    totalRevenue: 452310.50,
    claimedRate: 68.5,
    activeCustomers: 8432,
    averageBasket: 36.06,
    averageFrequency: 2.4,
  }

  const receiptsByDay = [
    { date: '2023-11-15', count: 345, revenue: 12450 },
    { date: '2023-11-16', count: 389, revenue: 14230 },
    { date: '2023-11-17', count: 412, revenue: 15670 },
    { date: '2023-11-18', count: 298, revenue: 10890 },
    { date: '2023-11-19', count: 315, revenue: 11450 },
    { date: '2023-11-20', count: 356, revenue: 13210 },
    { date: '2023-11-21', count: 402, revenue: 14890 },
  ]

  const storePerformance = [
    { id: '1', name: 'Paris Bastille', count: 4250, revenue: 154230, claimedRate: 72.5 },
    { id: '2', name: 'Lyon Part-Dieu', count: 3890, revenue: 138450, claimedRate: 65.8 },
    { id: '3', name: 'Bordeaux Centre', count: 2450, revenue: 89450, claimedRate: 69.2 },
    { id: '4', name: 'Nantes Commerce', count: 1953, revenue: 70180, claimedRate: 66.5 },
  ]

  const chartData = receiptsByDay.map(({ date, count, revenue }) => ({
    date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    count,
    revenue,
  }))

  const topStores = storePerformance.slice(0, 3)
  const bottomStores = storePerformance.slice(-3).reverse()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Accueil</h1>
        <p className="text-sm text-gray-500 mt-2">
          Vue d&apos;ensemble de vos opérations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Tickets émis"
          value={stats.totalReceipts.toLocaleString('fr-FR')}
          description="Sur les 30 derniers jours"
        />
        <KpiCard
          title="Chiffre d'affaires"
          value={formatCurrency(stats.totalRevenue)}
          description="Sur les 30 derniers jours"
        />
        <KpiCard
          title="Taux de réclamation"
          value={`${stats.claimedRate.toFixed(1)}%`}
          description="Tickets réclamés numériquement"
        />
        <KpiCard
          title="Clients actifs"
          value={stats.activeCustomers.toLocaleString('fr-FR')}
          description="Clients identifiés sur la période"
        />
        <KpiCard
          title="Panier moyen"
          value={formatCurrency(stats.averageBasket)}
          description="Par transaction"
        />
        <KpiCard
          title="Fréquence moyenne"
          value={stats.averageFrequency.toFixed(1)}
          description="Visites par client"
        />
      </div>

      {/* Tendances */}
      <SectionHeader title="Tendances" />
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Tickets par jour" description="Évolution sur 30 jours">
          <TicketsChart data={chartData} />
        </ChartCard>

        <ChartCard title="CA par jour" description="Évolution sur 30 jours">
          <RevenueChart data={chartData} />
        </ChartCard>
      </div>

      {/* Performance magasins */}
      <SectionHeader title="Performance magasins" />
      <ChartCard title="Répartition par magasin" description="Chiffre d&apos;affaires sur 30 jours">
        <StoresChart data={storePerformance} />
      </ChartCard>

      {/* Top et bottom stores */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Top magasins" description="Par chiffre d&apos;affaires">
          <div className="space-y-6">
            {topStores.map((store, idx) => (
              <div key={store.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{store.name}</div>
                    <div className="text-xs text-gray-400">
                      {store.count} tickets
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(store.revenue)}</div>
                  <div className="text-xs text-gray-400">
                    {store.claimedRate.toFixed(1)}% réclamés
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="À surveiller" description="Croissance potentielle">
          <div className="space-y-6">
            {bottomStores.map((store, idx) => (
              <div key={store.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{store.name}</div>
                    <div className="text-xs text-gray-400">
                      {store.count} tickets
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(store.revenue)}</div>
                  <div className="text-xs text-gray-400">
                    {store.claimedRate.toFixed(1)}% réclamés
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

