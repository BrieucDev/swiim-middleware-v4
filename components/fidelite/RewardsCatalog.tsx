'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit } from 'lucide-react'
import { useState } from 'react'

interface Reward {
  id: string
  name: string
  type: string
  costPoints: number
  conditions?: string
  status: 'ACTIF' | 'INACTIF'
}

interface RewardsCatalogProps {
  rewards: Reward[]
  onCreate: (reward: Partial<Reward>) => Promise<void>
  onUpdate: (id: string, reward: Partial<Reward>) => Promise<void>
}

const rewardTypeLabels: Record<string, string> = {
  REMISE_PERCENT: 'Remise %',
  PRODUIT_OFFERT: 'Produit offert',
  BON_ACHAT: 'Bon d\'achat',
  SERVICE: 'Service',
}

export function RewardsCatalog({ rewards, onCreate, onUpdate }: RewardsCatalogProps) {
  const [isCreating, setIsCreating] = useState(false)

  return (
    <Card className="bg-white/90 border border-gray-100/70 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Catalogue de récompenses
          </CardTitle>
          <Button
            onClick={() => setIsCreating(true)}
            className="rounded-full bg-[#C7FF06] text-gray-900 hover:bg-[#C7FF06]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une récompense
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100">
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Coût (points)</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Conditions</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Aucune récompense définie
                  </TableCell>
                </TableRow>
              ) : (
                rewards.map((reward) => (
                  <TableRow key={reward.id} className="border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="font-medium text-gray-900">{reward.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        {rewardTypeLabels[reward.type] || reward.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-[#C7FF06]">
                      {reward.costPoints.toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {reward.conditions || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={reward.status === 'ACTIF' ? 'default' : 'secondary'}
                        className={reward.status === 'ACTIF' ? 'bg-[#C7FF06] text-gray-900' : ''}
                      >
                        {reward.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* TODO: Edit reward */}}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}



