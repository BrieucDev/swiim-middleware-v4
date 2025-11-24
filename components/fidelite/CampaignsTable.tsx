'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit } from 'lucide-react'
import { useState } from 'react'
import { CampaignCreator } from './CampaignCreator'
import { StatusBadge } from '@/components/dashboard/status-badge'

interface Campaign {
  id: string
  name: string
  targetSegment: string
  channel: string
  offerType: string
  status: string
  stats?: {
    sent?: number
    opened?: number
    clicked?: number
    conversions?: number
    extraRevenue?: number
  }
}

interface CampaignsTableProps {
  campaigns: Campaign[]
  programId: string
  onCreate: (campaign: Partial<Campaign>) => Promise<void>
  onUpdate: (id: string, campaign: Partial<Campaign>) => Promise<void>
}

const channelLabels: Record<string, string> = {
  EMAIL: 'Email',
  PUSH: 'Notification',
  INAPP: 'In-app',
}

const offerTypeLabels: Record<string, string> = {
  BONUS_POINTS: 'Bonus points',
  REMISE: 'Remise',
  PRODUIT_OFFERT: 'Produit offert',
}

export function CampaignsTable({ campaigns, programId, onCreate, onUpdate }: CampaignsTableProps) {
  const [isCreating, setIsCreating] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
  }

  const calculateOpenRate = (campaign: Campaign) => {
    if (!campaign.stats?.sent || campaign.stats.sent === 0) return 0
    return ((campaign.stats.opened || 0) / campaign.stats.sent) * 100
  }

  const calculateConversionRate = (campaign: Campaign) => {
    if (!campaign.stats?.sent || campaign.stats.sent === 0) return 0
    return ((campaign.stats.conversions || 0) / campaign.stats.sent) * 100
  }

  return (
    <>
      <Card className="bg-white/90 border border-gray-100/70 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Campagnes de fidélité
            </CardTitle>
            <Button
              onClick={() => setIsCreating(true)}
              className="rounded-full bg-[#C7FF06] text-gray-900 hover:bg-[#C7FF06]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une campagne
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100">
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Canal</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type d'offre</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Envoyés</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Ouverture</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Conversion</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">CA généré</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                      Aucune campagne créée
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="border-gray-100 hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">{campaign.name}</TableCell>
                      <TableCell className="text-gray-600">{campaign.targetSegment}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">
                          {channelLabels[campaign.channel] || campaign.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {offerTypeLabels[campaign.offerType] || campaign.offerType}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={campaign.status} />
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {campaign.stats?.sent || 0}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {calculateOpenRate(campaign).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {calculateConversionRate(campaign).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-medium text-[#C7FF06]">
                        {campaign.stats?.extraRevenue ? formatCurrency(campaign.stats.extraRevenue) : '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: Edit campaign */}}
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

      {isCreating && (
        <CampaignCreator
          programId={programId}
          open={isCreating}
          onOpenChange={setIsCreating}
          onSave={async (campaign) => {
            await onCreate(campaign)
            setIsCreating(false)
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}
    </>
  )
}



