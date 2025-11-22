import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

async function getStoresWithStats() {
  const stores = await prisma.store.findMany({
    include: {
      receipts: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      _count: {
        select: {
          pos: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return stores.map((store) => {
    const receipts = store.receipts
    const revenue = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0)
    const count = receipts.length
    const claimed = receipts.filter((r) => r.status === 'RECLAME').length
    const claimedRate = count > 0 ? (claimed / count) * 100 : 0

    return {
      id: store.id,
      name: store.name,
      city: store.city,
      address: store.address,
      revenue,
      receiptCount: count,
      claimedRate,
      terminalCount: store._count.pos,
    }
  })
}

export default async function MagasinsPage() {
  const stores = await getStoresWithStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Magasins</h1>
        <p className="text-muted-foreground mt-2">
          Gestion et performance des magasins
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <Card key={store.id}>
            <CardHeader>
              <CardTitle>{store.name}</CardTitle>
              <CardDescription>{store.city || 'Non spécifié'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CA (30j)</span>
                  <span className="font-medium">{formatCurrency(store.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tickets (30j)</span>
                  <span className="font-medium">{store.receiptCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taux de réclamation</span>
                  <span className="font-medium">{store.claimedRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TPE actifs</span>
                  <span className="font-medium">{store.terminalCount}</span>
                </div>
              </div>
              <Link href={`/magasins/${store.id}`}>
                <Button variant="outline" className="w-full">
                  Voir les détails
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vue d&apos;ensemble</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Magasin</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead className="text-right">CA (30j)</TableHead>
                <TableHead className="text-right">Tickets (30j)</TableHead>
                <TableHead className="text-right">Taux de réclamation</TableHead>
                <TableHead className="text-right">TPE</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell>{store.city || '-'}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(store.revenue)}
                  </TableCell>
                  <TableCell className="text-right">{store.receiptCount}</TableCell>
                  <TableCell className="text-right">{store.claimedRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{store.terminalCount}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/magasins/${store.id}`}>
                      <Button variant="ghost" size="sm">
                        Voir
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

