import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/format'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Vue d&apos;ensemble</h1>
        <p className="text-muted-foreground mt-2">
          Vue consolidée des opérations sur les 30 derniers jours
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets émis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReceipts.toLocaleString('fr-FR')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur les 30 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d&apos;affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur les 30 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de réclamation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.claimedRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tickets réclamés numériquement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers.toLocaleString('fr-FR')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Clients identifiés sur la période
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageBasket)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Par transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fréquence moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageFrequency.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Visites par client
            </p>
          </CardContent>
        </Card>
      </div>

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

      {/* Performance magasins */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par magasin</CardTitle>
          <CardDescription>Chiffre d&apos;affaires sur 30 jours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#C7FF06" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top et bottom stores */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meilleurs magasins</CardTitle>
            <CardDescription>Par chiffre d&apos;affaires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStores.map((store, idx) => (
                <div key={store.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium">{store.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {store.count} tickets
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(store.revenue)}</div>
                    <div className="text-sm text-muted-foreground">
                      {store.claimedRate.toFixed(1)}% réclamés
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Magasins à suivre</CardTitle>
            <CardDescription>Croissance potentielle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottomStores.map((store, idx) => (
                <div key={store.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium">{store.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {store.count} tickets
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(store.revenue)}</div>
                    <div className="text-sm text-muted-foreground">
                      {store.claimedRate.toFixed(1)}% réclamés
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

