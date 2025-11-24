'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Check } from 'lucide-react'
import { useState } from 'react'
import { ProgramRulesEditor } from './ProgramRulesEditor'

interface ProgramRules {
  pointsPerEuro: number
  conversionRate: number
  conversionValue: number
  bonusCategories?: Record<string, number>
  pointsExpiryDays?: number
  welcomeBonus?: number
  birthdayBonus?: number
  reactivationBonus?: { points: number; inactivityDays: number }
  lastUpdated?: Date
  updatedBy?: string
}

interface ProgramRulesCardProps {
  rules: ProgramRules
  onUpdate: (rules: Partial<ProgramRules>) => Promise<void>
}

export function ProgramRulesCard({ rules, onUpdate }: ProgramRulesCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <Card className="bg-white/90 border border-gray-100/70 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Règles du programme
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="rounded-full border-[#C7FF06] text-[#C7FF06] hover:bg-[#C7FF06] hover:text-gray-900"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier les règles
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Points par euro
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                1€ = {rules.pointsPerEuro} point{rules.pointsPerEuro > 1 ? 's' : ''}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Conversion
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {rules.conversionRate} points = {rules.conversionValue}€
              </p>
            </div>

            {rules.bonusCategories && Object.keys(rules.bonusCategories).length > 0 && (
              <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 md:col-span-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Bonus catégories
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(rules.bonusCategories).map(([category, multiplier]) => (
                    <span
                      key={category}
                      className="px-3 py-1 rounded-full bg-[#C7FF06]/20 text-[#C7FF06] text-sm font-medium border border-[#C7FF06]/30"
                    >
                      {category}: x{multiplier}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {rules.pointsExpiryDays && (
              <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Expiration
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {rules.pointsExpiryDays} jour{rules.pointsExpiryDays > 1 ? 's' : ''}
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 md:col-span-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Bonus automatiques
              </p>
              <div className="space-y-2">
                {rules.welcomeBonus && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#C7FF06]" />
                    <span className="text-sm text-gray-700">
                      Bonus de bienvenue: {rules.welcomeBonus} points
                    </span>
                  </div>
                )}
                {rules.birthdayBonus && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#C7FF06]" />
                    <span className="text-sm text-gray-700">
                      Bonus d'anniversaire: {rules.birthdayBonus} points
                    </span>
                  </div>
                )}
                {rules.reactivationBonus && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#C7FF06]" />
                    <span className="text-sm text-gray-700">
                      Bonus de réactivation: {rules.reactivationBonus.points} points après {rules.reactivationBonus.inactivityDays} jours d'inactivité
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {rules.lastUpdated && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Dernière mise à jour le {new Date(rules.lastUpdated).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {rules.updatedBy && ` par ${rules.updatedBy}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <ProgramRulesEditor
          rules={rules}
          onSave={async (updatedRules) => {
            await onUpdate(updatedRules)
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </>
  )
}



