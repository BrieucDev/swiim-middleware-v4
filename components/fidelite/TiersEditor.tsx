'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

interface LoyaltyTier {
  id: string
  name: string
  minSpend: number
  maxSpend?: number
  benefits?: any
}

interface TiersEditorProps {
  tiers: LoyaltyTier[]
  onSave: (tiers: LoyaltyTier[]) => Promise<void>
  onCancel: () => void
}

export function TiersEditor({ tiers, onSave, onCancel }: TiersEditorProps) {
  const [editedTiers, setEditedTiers] = useState<LoyaltyTier[]>(tiers)

  const updateTier = (index: number, field: keyof LoyaltyTier, value: any) => {
    const updated = [...editedTiers]
    updated[index] = { ...updated[index], [field]: value }
    setEditedTiers(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(editedTiers)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Modifier les niveaux de fidélité
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            {editedTiers.map((tier, index) => (
              <div key={tier.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`minSpend-${index}`}>Dépenses minimum (€)</Label>
                    <Input
                      id={`minSpend-${index}`}
                      type="number"
                      min="0"
                      step="10"
                      value={tier.minSpend}
                      onChange={(e) => updateTier(index, 'minSpend', parseFloat(e.target.value) || 0)}
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`maxSpend-${index}`}>Dépenses maximum (€) - optionnel</Label>
                    <Input
                      id={`maxSpend-${index}`}
                      type="number"
                      min="0"
                      step="10"
                      value={tier.maxSpend || ''}
                      onChange={(e) => updateTier(index, 'maxSpend', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="Illimité si vide"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`benefits-${index}`}>Avantages (un par ligne)</Label>
                  <Textarea
                    id={`benefits-${index}`}
                    value={Array.isArray(tier.benefits) ? tier.benefits.join('\n') : (tier.benefits ? String(tier.benefits) : '')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').filter(l => l.trim())
                      updateTier(index, 'benefits', lines.length > 0 ? lines : undefined)
                    }}
                    placeholder="Exemple:&#10;Remise de 5% sur tous les achats&#10;Accès prioritaire aux ventes privées&#10;Invitations événements exclusifs"
                    className="rounded-lg min-h-[100px]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-full"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-[#C7FF06] text-gray-900 hover:bg-[#C7FF06]/90"
            >
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



