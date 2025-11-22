'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LoyaltyProgramEditor({ program }: { program: any }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    pointsPerEuro: program.pointsPerEuro.toString(),
    conversionRate: program.conversionRate.toString(),
    conversionValue: program.conversionValue.toString(),
    pointsExpiryDays: program.pointsExpiryDays?.toString() || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/loyalty/program/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointsPerEuro: parseFloat(formData.pointsPerEuro),
          conversionRate: parseInt(formData.conversionRate),
          conversionValue: parseFloat(formData.conversionValue),
          pointsExpiryDays: formData.pointsExpiryDays ? parseInt(formData.pointsExpiryDays) : null,
        }),
      })

      if (response.ok) {
        router.refresh()
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Error updating program:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier le programme</DialogTitle>
            <DialogDescription>
              Mettez à jour les règles du programme de fidélité.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pointsPerEuro">Points par euro</Label>
              <Input
                id="pointsPerEuro"
                type="number"
                step="0.1"
                value={formData.pointsPerEuro}
                onChange={(e) => setFormData({ ...formData, pointsPerEuro: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conversionRate">Taux de conversion (points)</Label>
              <Input
                id="conversionRate"
                type="number"
                value={formData.conversionRate}
                onChange={(e) => setFormData({ ...formData, conversionRate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conversionValue">Valeur de conversion (€)</Label>
              <Input
                id="conversionValue"
                type="number"
                step="0.01"
                value={formData.conversionValue}
                onChange={(e) => setFormData({ ...formData, conversionValue: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pointsExpiryDays">Expiration des points (jours)</Label>
              <Input
                id="pointsExpiryDays"
                type="number"
                value={formData.pointsExpiryDays}
                onChange={(e) => setFormData({ ...formData, pointsExpiryDays: e.target.value })}
                placeholder="Optionnel"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

