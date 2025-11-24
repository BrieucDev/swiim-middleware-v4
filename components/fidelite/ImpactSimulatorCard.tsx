'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { TrendingUp, Users, Coins, DollarSign } from 'lucide-react'
import { simulateProgramChange } from '@/app/actions/loyalty'

interface ImpactSimulatorCardProps {
  onSimulate: (params: {
    pointsPerEuroChange?: number
    bonusCategory?: string
    tierThresholdChange?: number
  }) => Promise<{
    impactCa: number
    clientsTouches: number
    coutPoints: number
    impactEngagement: number
    commentaire: string
  }>
}

export function ImpactSimulatorCard({ onSimulate }: ImpactSimulatorCardProps) {
  const [params, setParams] = useState({
    pointsPerEuroChange: 0,
    bonusCategory: '',
    tierThresholdChange: 0,
  })
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSimulate = async () => {
    setIsLoading(true)
    try {
      const res = await onSimulate(params)
      setResult(res)
    } catch (error) {
      console.error('Simulation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white/90 border border-gray-100/70 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Simuler une modification du programme
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pointsChange">Augmenter les points par euro de (%)</Label>
            <Input
              id="pointsChange"
              type="number"
              min="-20"
              max="50"
              step="5"
              value={params.pointsPerEuroChange}
              onChange={(e) => setParams({ ...params, pointsPerEuroChange: parseInt(e.target.value) || 0 })}
              className="rounded-lg"
            />
            <p className="text-xs text-gray-400">De -20% à +50%</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonusCategory">Ajouter un bonus x2 sur la catégorie</Label>
            <Select
              value={params.bonusCategory}
              onValueChange={(value) => setParams({ ...params, bonusCategory: value })}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun</SelectItem>
                <SelectItem value="Livres">Livres</SelectItem>
                <SelectItem value="Hi-Tech">Hi-Tech</SelectItem>
                <SelectItem value="Gaming">Gaming</SelectItem>
                <SelectItem value="Vinyles">Vinyles</SelectItem>
                <SelectItem value="Accessoires">Accessoires</SelectItem>
                <SelectItem value="Musique">Musique</SelectItem>
                <SelectItem value="Cinéma">Cinéma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tierChange">Réduire le seuil du niveau Or de (%)</Label>
            <Input
              id="tierChange"
              type="number"
              min="0"
              max="50"
              step="5"
              value={params.tierThresholdChange}
              onChange={(e) => setParams({ ...params, tierThresholdChange: parseInt(e.target.value) || 0 })}
              className="rounded-lg"
            />
            <p className="text-xs text-gray-400">Optionnel</p>
          </div>
        </div>

        <Button
          onClick={handleSimulate}
          disabled={isLoading}
          className="w-full rounded-full bg-[#C7FF06] text-gray-900 hover:bg-[#C7FF06]/90"
        >
          {isLoading ? 'Simulation...' : 'Simuler l\'impact'}
        </Button>

        {result && (
          <div className="p-5 rounded-xl bg-gray-50/50 border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900">Résultats de la simulation</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#C7FF06]/20">
                  <DollarSign className="h-5 w-5 text-[#C7FF06]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">CA additionnel estimé</p>
                  <p className="text-lg font-semibold text-[#C7FF06]">
                    +{result.impactCa.toLocaleString('fr-FR')}€
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#C7FF06]/20">
                  <Users className="h-5 w-5 text-[#C7FF06]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Clients touchés</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.clientsTouches.toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#C7FF06]/20">
                  <Coins className="h-5 w-5 text-[#C7FF06]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Coût en points</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.coutPoints.toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#C7FF06]/20">
                  <TrendingUp className="h-5 w-5 text-[#C7FF06]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Impact engagement</p>
                  <p className="text-lg font-semibold text-gray-900">
                    +{result.impactEngagement.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {result.commentaire && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-700">{result.commentaire}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

