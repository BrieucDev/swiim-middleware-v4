'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/format'

const categories = ['Livres', 'Hi-Tech', 'Gaming', 'Vinyles', 'Accessoires', 'Musique', 'Cinéma']

export function ImpactSimulator({ programId }: { programId: string }) {
  const [type, setType] = useState<'points' | 'category'>('points')
  const [pointsIncrease, setPointsIncrease] = useState('')
  const [category, setCategory] = useState('')
  const [categoryBonus, setCategoryBonus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleSimulate = async () => {
    setIsLoading(true)
    setResults(null)

    try {
      const params: any = {}
      if (type === 'points') {
        params.pointsPerEuroIncrease = parseFloat(pointsIncrease)
      } else {
        params.bonusCategory = {
          category,
          bonus: parseFloat(categoryBonus),
        }
      }

      const response = await fetch('/api/loyalty/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Error simulating impact:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simulateur d&apos;impact</CardTitle>
          <CardDescription>
            Estimez l&apos;impact des changements de règles sur votre programme de fidélité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Type de simulation</Label>
            <Select value={type} onValueChange={(value: 'points' | 'category') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Augmenter les points par euro</SelectItem>
                <SelectItem value="category">Ajouter un bonus catégorie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'points' ? (
            <div className="space-y-2">
              <Label htmlFor="pointsIncrease">Augmentation (%)</Label>
              <Input
                id="pointsIncrease"
                type="number"
                step="1"
                value={pointsIncrease}
                onChange={(e) => setPointsIncrease(e.target.value)}
                placeholder="10"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryBonus">Bonus (%)</Label>
                <Input
                  id="categoryBonus"
                  type="number"
                  step="1"
                  value={categoryBonus}
                  onChange={(e) => setCategoryBonus(e.target.value)}
                  placeholder="20"
                />
              </div>
            </>
          )}

          <Button onClick={handleSimulate} disabled={isLoading || (type === 'points' ? !pointsIncrease : !category || !categoryBonus)}>
            {isLoading ? 'Calcul...' : 'Simuler'}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de la simulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-sm text-muted-foreground">CA additionnel estimé</div>
                <div className="text-2xl font-bold">{formatCurrency(results.additionalRevenue)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Clients touchés</div>
                <div className="text-2xl font-bold">{results.customersAffected}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Coût en points</div>
                <div className="text-2xl font-bold">{results.additionalPoints.toLocaleString('fr-FR')}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Impact engagement</div>
                <div className="text-2xl font-bold">+{results.engagementImpact.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

