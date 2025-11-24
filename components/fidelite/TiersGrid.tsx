'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Users } from 'lucide-react'
import { useState } from 'react'
import { TiersEditor } from './TiersEditor'

interface LoyaltyTier {
  id: string
  name: string
  minSpend: number
  maxSpend?: number
  benefits?: any
  memberCount?: number
}

interface TiersGridProps {
  tiers: LoyaltyTier[]
  onUpdate: (tiers: LoyaltyTier[]) => Promise<void>
}

const tierColors = {
  Bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  Argent: 'bg-gray-100 text-gray-800 border-gray-200',
  Or: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

export function TiersGrid({ tiers, onUpdate }: TiersGridProps) {
  const [isEditing, setIsEditing] = useState(false)

  const getTierColor = (name: string) => {
    if (name.toLowerCase().includes('bronze')) return tierColors.Bronze
    if (name.toLowerCase().includes('argent') || name.toLowerCase().includes('silver')) return tierColors.Argent
    if (name.toLowerCase().includes('or') || name.toLowerCase().includes('gold')) return tierColors.Or
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <>
      <Card className="bg-white/90 border border-gray-100/70 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Niveaux de fidélité
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="rounded-full border-[#C7FF06] text-[#C7FF06] hover:bg-[#C7FF06] hover:text-gray-900"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier les niveaux
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid gap-4 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="p-6 rounded-xl border border-gray-100 bg-gray-50/50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTierColor(tier.name)}`}>
                    {tier.name}
                  </span>
                  {tier.memberCount !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{tier.memberCount}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Seuil de dépenses
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {tier.minSpend.toLocaleString('fr-FR')}€
                      {tier.maxSpend ? ` - ${tier.maxSpend.toLocaleString('fr-FR')}€` : '+'}
                    </p>
                  </div>

                  {tier.benefits && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Avantages
                      </p>
                      <ul className="space-y-1">
                        {Array.isArray(tier.benefits) ? (
                          tier.benefits.map((benefit: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-[#C7FF06] mt-1">•</span>
                              <span>{benefit}</span>
                            </li>
                          ))
                        ) : typeof tier.benefits === 'object' && tier.benefits !== null ? (
                          Object.entries(tier.benefits).map(([key, value]) => (
                            <li key={key} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-[#C7FF06] mt-1">•</span>
                              <span>{key}: {String(value)}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-700">{String(tier.benefits)}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <TiersEditor
          tiers={tiers}
          onSave={async (updatedTiers) => {
            await onUpdate(updatedTiers)
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </>
  )
}



