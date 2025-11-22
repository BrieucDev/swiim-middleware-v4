import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, maskEmail } from '@/lib/format'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

async function getCustomers(searchParams: { query?: string; tier?: string; activity?: string }) {
  const where: any = {}

  if (searchParams.query) {
    where.OR = [
      { firstName: { contains: searchParams.query, mode: 'insensitive' } },
      { lastName: { contains: searchParams.query, mode: 'insensitive' } },
      { email: { contains: searchParams.query, mode: 'insensitive' } },
    ]
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      receipts: {
        include: {
          lineItems: true,
        },
      },
      loyaltyAccount: {
        include: {
          tier: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  return customers
    .map((customer) => {
      const receipts = customer.receipts
      const totalSpend = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0)
      const lastReceipt = receipts.length > 0
        ? receipts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
        : null
      const lastVisit = lastReceipt?.createdAt
      const isActive = lastVisit && lastVisit >= thirtyDaysAgo

      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        tier: customer.loyaltyAccount?.tier?.name || null,
        receiptCount: receipts.length,
        lastVisit,
        totalSpend,
        isActive,
      }
    })
    .filter((c) => {
      if (searchParams.tier && searchParams.tier !== 'all') {
        if (searchParams.tier === 'none' && c.tier) return false
        if (searchParams.tier !== 'none' && c.tier !== searchParams.tier) return false
      }
      if (searchParams.activity) {
        if (searchParams.activity === 'active' && !c.isActive) return false
        if (searchParams.activity === 'inactive' && c.isActive) return false
      }
      return true
    })
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { query?: string; tier?: string; activity?: string }
}) {
  const customers = await getCustomers(searchParams)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground mt-2">
          Gestion et suivi des clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="query"
                placeholder="Rechercher par nom ou email..."
                defaultValue={searchParams.query}
                className="pl-10"
              />
            </div>
            <select
              name="tier"
              defaultValue={searchParams.tier || 'all'}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tous les niveaux</option>
              <option value="Or">Or</option>
              <option value="Argent">Argent</option>
              <option value="Bronze">Bronze</option>
              <option value="none">Aucun niveau</option>
            </select>
            <select
              name="activity"
              defaultValue={searchParams.activity || 'all'}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs (30 derniers jours)</option>
              <option value="inactive">Inactifs (&gt;30 jours)</option>
            </select>
            <Button type="submit">Filtrer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Niveau fidélité</TableHead>
                <TableHead>Nombre de tickets</TableHead>
                <TableHead>Dernière visite</TableHead>
                <TableHead className="text-right">Total dépensé</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {maskEmail(customer.email)}
                    </TableCell>
                    <TableCell>
                      {customer.tier ? (
                        <Badge variant={customer.tier === 'Or' ? 'warning' : customer.tier === 'Argent' ? 'default' : 'secondary'}>
                          {customer.tier}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{customer.receiptCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.lastVisit ? formatDate(customer.lastVisit) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(customer.totalSpend)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/clients/${customer.id}`}>
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

