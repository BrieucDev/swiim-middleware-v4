'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'

interface ProgramRules {
  pointsPerEuro: number
  conversionRate: number
  conversionValue: number
  bonusCategories?: Record<string, number>
  pointsExpiryDays?: number
  welcomeBonus?: number
  birthdayBonus?: number
  reactivationBonus?: { points: number; inactivityDays: number }
}

interface ProgramRulesEditorProps {
  rules: ProgramRules
  onSave: (rules: Partial<ProgramRules>) => Promise<void>
  onCancel: () => void
}

export function ProgramRulesEditor({ rules, onSave, onCancel }: ProgramRulesEditorProps) {
  const [formData, setFormData] = useState<Partial<ProgramRules>>({
    pointsPerEuro: rules.pointsPerEuro,
    conversionRate: rules.conversionRate,
    conversionValue: rules.conversionValue,
    bonusCategories: rules.bonusCategories || {},
    pointsExpiryDays: rules.pointsExpiryDays,
    welcomeBonus: rules.welcomeBonus,
    birthdayBonus: rules.birthdayBonus,
    reactivationBonus: rules.reactivationBonus,
  })

  const [newCategory, setNewCategory] = useState({ name: '', multiplier: 2 })

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.multiplier > 0) {
      setFormData({
        ...formData,
        bonusCategories: {
          ...formData.bonusCategories,
          [newCategory.name]: newCategory.multiplier,
        },
      })
      setNewCategory({ name: '', multiplier: 2 })
    }
  }

  const handleRemoveCategory = (category: string) => {
    const updated = { ...formData.bonusCategories }
    delete updated[category]
    setFormData({ ...formData, bonusCategories: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Modifier les règles du programme
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pointsPerEuro">Points par euro dépensé</Label>
              <Input
                id="pointsPerEuro"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.pointsPerEuro || 1}
                onChange={(e) => setFormData({ ...formData, pointsPerEuro: parseFloat(e.target.value) })}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conversionRate">Points pour conversion</Label>
              <Input
                id="conversionRate"
                type="number"
                min="1"
                value={formData.conversionRate || 100}
                onChange={(e) => setFormData({ ...formData, conversionRate: parseInt(e.target.value) })}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conversionValue">Valeur en euros</Label>
              <Input
                id="conversionValue"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.conversionValue || 5}
                onChange={(e) => setFormData({ ...formData, conversionValue: parseFloat(e.target.value) })}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pointsExpiryDays">Expiration (en jours)</Label>
              <Input
                id="pointsExpiryDays"
                type="number"
                min="0"
                value={formData.pointsExpiryDays || ''}
                onChange={(e) => setFormData({ ...formData, pointsExpiryDays: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Illimité si vide"
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Bonus catégories</Label>
            <div className="space-y-2">
              {formData.bonusCategories && Object.entries(formData.bonusCategories).map(([category, multiplier]) => (
                <div key={category} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <span className="flex-1 text-sm text-gray-700">{category}</span>
                  <span className="text-sm font-medium text-gray-900">x{multiplier}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCategory(category)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Nom de la catégorie"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="flex-1 rounded-lg"
                />
                <Input
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="Multiplicateur"
                  value={newCategory.multiplier}
                  onChange={(e) => setNewCategory({ ...newCategory, multiplier: parseFloat(e.target.value) || 2 })}
                  className="w-24 rounded-lg"
                />
                <Button
                  type="button"
                  onClick={handleAddCategory}
                  className="rounded-lg bg-[#C7FF06] text-gray-900 hover:bg-[#C7FF06]/90"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Bonus automatiques</Label>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="welcomeBonus" className="text-sm">Bonus de bienvenue (points)</Label>
                <Input
                  id="welcomeBonus"
                  type="number"
                  min="0"
                  value={formData.welcomeBonus || ''}
                  onChange={(e) => setFormData({ ...formData, welcomeBonus: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Désactivé si vide"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdayBonus" className="text-sm">Bonus d'anniversaire (points)</Label>
                <Input
                  id="birthdayBonus"
                  type="number"
                  min="0"
                  value={formData.birthdayBonus || ''}
                  onChange={(e) => setFormData({ ...formData, birthdayBonus: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Désactivé si vide"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reactivationPoints" className="text-sm">Bonus réactivation (points)</Label>
                <Input
                  id="reactivationPoints"
                  type="number"
                  min="0"
                  value={formData.reactivationBonus?.points || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    reactivationBonus: e.target.value ? {
                      points: parseInt(e.target.value),
                      inactivityDays: formData.reactivationBonus?.inactivityDays || 45
                    } : undefined
                  })}
                  placeholder="Désactivé si vide"
                  className="rounded-lg"
                />
              </div>
            </div>
            {formData.reactivationBonus && (
              <div className="space-y-2">
                <Label htmlFor="reactivationDays" className="text-sm">Seuil d'inactivité (jours)</Label>
                <Input
                  id="reactivationDays"
                  type="number"
                  min="1"
                  value={formData.reactivationBonus.inactivityDays || 45}
                  onChange={(e) => setFormData({
                    ...formData,
                    reactivationBonus: {
                      ...formData.reactivationBonus!,
                      inactivityDays: parseInt(e.target.value) || 45
                    }
                  })}
                  className="rounded-lg"
                />
              </div>
            )}
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



