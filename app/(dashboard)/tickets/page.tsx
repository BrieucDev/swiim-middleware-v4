import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { formatCurrency, formatDate, formatReceiptId, maskEmail } from '@/lib/format'
import Link from 'next/link'
import { Search } from 'lucide-react'

async function getReceipts(searchParams: { status?: string; store?: string; query?: string }) {
  const where: any = {}

  if (searchParams.status) {
    where.status = searchParams.status
  }

  if (searchParams.store && searchParams.store !== 'all') {
    where.storeId = searchParams.store
  }

  if (searchParams.query) {
    where.OR = [
      { id: { contains: searchParams.query, mode: 'insensitive' } },
      { customer: { email: { contains: searchParams.query, mode: 'insensitive' } } },
    ]
  }

  return await prisma.receipt.findMany({
    where,
    include: {
      store: true,
      pos: true,
      customer: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  })
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { status?: string; store?: string; query?: string }
}) {
  const receipts = await getReceipts(searchParams)
  const stores = await prisma.store.findMany({ orderBy: { name: 'asc' } })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      EMIS: 'default',
      RECLAME: 'success',
      REMBOURSE: 'warning',
      ANNULE: 'destructive',
    }
    return variants[status] || 'default'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tickets</h1>
        <p className="text-muted-foreground mt-2">
          Gestion et consultation des tickets de caisse
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
                placeholder="Rechercher par référence ou email..."
                defaultValue={searchParams.query}
                className="pl-10"
              />
            </div>
            <select
              name="status"
              defaultValue={searchParams.status || 'all'}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="EMIS">Émis</option>
              <option value="RECLAME">Réclamé</option>
              <option value="REMBOURSE">Remboursé</option>
              <option value="ANNULE">Annulé</option>
            </select>
            <select
              name="store"
              defaultValue={searchParams.store || 'all'}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tous les magasins</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            <Button type="submit">Filtrer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Magasin</TableHead>
                <TableHead>TPE</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Aucun ticket trouvé
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-mono font-medium">
                      {formatReceiptId(receipt.id)}
                    </TableCell>
                    <TableCell>{receipt.store.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {receipt.pos.name}
                    </TableCell>
                    <TableCell>
                      {receipt.customer ? maskEmail(receipt.customer.email) : '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(Number(receipt.totalAmount))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(receipt.status)}>
                        {receipt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(receipt.createdAt)}
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

