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
import { CreateTerminalDialog } from '@/components/tpe/CreateTerminalDialog'
import { formatDate } from '@/lib/format'
import { Plus } from 'lucide-react'

async function getTerminals() {
  return await prisma.posTerminal.findMany({
    include: {
      store: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

async function getStores() {
  return await prisma.store.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
}

export default async function TPEClesPage() {
  const terminals = await getTerminals()
  const stores = await getStores()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TPE & Clés</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des terminaux de paiement et clés d&apos;authentification
          </p>
        </div>
        <CreateTerminalDialog stores={stores} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Terminaux de paiement</CardTitle>
          <CardDescription>Liste de tous les TPE configurés</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Identifiant</TableHead>
                <TableHead>Magasin</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière activité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terminals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aucun terminal configuré
                  </TableCell>
                </TableRow>
              ) : (
                terminals.map((terminal) => (
                  <TableRow key={terminal.id}>
                    <TableCell className="font-medium">{terminal.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {terminal.identifier}
                    </TableCell>
                    <TableCell>{terminal.store.name}</TableCell>
                    <TableCell>
                      <Badge variant={terminal.status === 'ACTIF' ? 'success' : 'default'}>
                        {terminal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {terminal.lastSeenAt ? formatDate(terminal.lastSeenAt) : '-'}
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

