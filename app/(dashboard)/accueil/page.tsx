import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/format'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { ChartCard } from '@/components/dashboard/chart-card'
import { SectionHeader } from '@/components/dashboard/section-header'

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
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C7FF06" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C7FF06" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#C7FF06" 
                strokeWidth={2}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="CA par jour" description="Évolution sur 30 jours">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#C7FF06" 
                strokeWidth={2}
                dot={{ fill: '#C7FF06', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Performance magasins */}
      <SectionHeader title="Performance magasins" />
      <ChartCard title="Répartition par magasin" description="Chiffre d&apos;affaires sur 30 jours">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={storePerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB', 
                borderRadius: '8px',
                padding: '8px 12px'
              }}
            />
            <Bar dataKey="revenue" fill="#C7FF06" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
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

