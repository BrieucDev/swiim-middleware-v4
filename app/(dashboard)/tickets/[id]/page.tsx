import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate, formatDateTime, formatReceiptId, maskEmail } from '@/lib/format'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Printer, RefreshCw } from 'lucide-react'

async function getReceipt(id: string) {
  return await prisma.receipt.findUnique({
    where: { id },
    include: {
      store: true,
      pos: true,
      customer: true,
      lineItems: true,
    },
  })
}

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const receipt = await getReceipt(params.id)

  if (!receipt) {
    notFound()
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      EMIS: 'default',
      RECLAME: 'success',
      REMBOURSE: 'warning',
      ANNULE: 'destructive',
    }
    return variants[status] || 'default'
  }

  const subtotal = receipt.lineItems.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  )
  const tva = subtotal * 0.2
  const total = subtotal + tva

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ticket {formatReceiptId(receipt.id)}</h1>
          <p className="text-muted-foreground mt-2">
            Détail et informations du ticket de caisse
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/tickets/${receipt.id}/print`} target="_blank">
            <Button>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer la version client
            </Button>
          </Link>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Régénérer le lien
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm text-muted-foreground">Magasin</div>
              <div className="font-medium">{receipt.store.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">TPE</div>
              <div className="font-medium">{receipt.pos.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="font-medium">{formatDateTime(receipt.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Statut</div>
              <Badge variant={getStatusBadge(receipt.status)} className="mt-1">
                {receipt.status}
              </Badge>
            </div>
          </div>
          {receipt.customer && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">Client</div>
              <div className="font-medium">{receipt.customer.firstName} {receipt.customer.lastName}</div>
              <div className="text-sm text-muted-foreground">{maskEmail(receipt.customer.email)}</div>
            </div>
          )}
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">Montant total</div>
            <div className="text-2xl font-bold">{formatCurrency(Number(receipt.totalAmount))}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ticket" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ticket">Ticket</TabsTrigger>
          <TabsTrigger value="transaction">Transaction</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="ticket" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket de caisse numérique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">SWIIM</div>
                  <div className="text-sm text-muted-foreground">
                    Ticket stocké côté client via Swiim
                  </div>
                </div>

                {/* Store Info */}
                <div className="border-t pt-4 space-y-1">
                  <div className="font-medium">{receipt.store.name}</div>
                  {receipt.store.address && (
                    <div className="text-sm text-muted-foreground">{receipt.store.address}</div>
                  )}
                  {receipt.store.city && (
                    <div className="text-sm text-muted-foreground">{receipt.store.city}</div>
                  )}
                </div>

                {/* Line Items */}
                <div className="border-t pt-4 space-y-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Article</TableHead>
                        <TableHead className="text-right">Qté</TableHead>
                        <TableHead className="text-right">Prix unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipt.lineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">{item.category}</div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number(item.unitPrice))}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(Number(item.unitPrice) * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total HT</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TVA (20%)</span>
                    <span className="font-medium">{formatCurrency(tva)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total TTC</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t pt-4 text-center text-sm text-muted-foreground">
                  <div>Référence: {formatReceiptId(receipt.id)}</div>
                  <div className="mt-1">{formatDateTime(receipt.createdAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">Méthode de paiement</div>
                  <div className="font-medium">Carte bancaire</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Terminal</div>
                  <div className="font-medium">{receipt.pos.identifier}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Autorisation</div>
                  <div className="font-medium font-mono">AUT-****-****-{receipt.id.slice(-4)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Montant</div>
                  <div className="font-medium">{formatCurrency(Number(receipt.totalAmount))}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historique" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-accent mt-2" />
                  </div>
                  <div className="flex-1 pb-4 border-b">
                    <div className="font-medium">Ticket créé</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(receipt.createdAt)}
                    </div>
                  </div>
                </div>
                {receipt.status === 'RECLAME' && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                    </div>
                    <div className="flex-1 pb-4 border-b">
                      <div className="font-medium">Ticket réclamé par le client</div>
                      <div className="text-sm text-muted-foreground">
                        Stocké dans l&apos;application mobile
                      </div>
                    </div>
                  </div>
                )}
                {receipt.status === 'REMBOURSE' && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Ticket remboursé</div>
                      <div className="text-sm text-muted-foreground">
                        Remboursement effectué
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {receipt.status !== 'REMBOURSE' && receipt.status !== 'ANNULE' && (
        <Card>
          <CardContent className="pt-6">
            <Button variant="outline">Marquer comme remboursé</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

