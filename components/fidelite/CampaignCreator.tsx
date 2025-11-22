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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const segments = [
  { value: 'INACTIFS_40J', label: 'Inactifs 40j+' },
  { value: 'GROS_PANIERS', label: 'Gros paniers' },
  { value: 'EXPLORATEURS', label: 'Explorateurs multi-catégories' },
  { value: 'POINTS_ELEVES', label: 'Points élevés' },
]

const channels = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'PUSH', label: 'Push' },
  { value: 'INAPP', label: 'In-app' },
]

const offerTypes = [
  { value: 'BONUS_POINTS', label: 'Bonus de points' },
  { value: 'REMISE', label: 'Remise' },
  { value: 'PRODUIT_OFFERT', label: 'Produit offert' },
]

export function CampaignCreator({ programId }: { programId: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetSegment: '',
    channel: '',
    offerType: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/loyalty/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId,
          ...formData,
          offerPayload: {},
          status: 'BROUILLON',
        }),
      })

      if (response.ok) {
        router.refresh()
        setIsOpen(false)
        setFormData({
          name: '',
          description: '',
          targetSegment: '',
          channel: '',
          offerType: '',
        })
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Créer une campagne
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer une campagne</DialogTitle>
            <DialogDescription>
              Créez une nouvelle campagne marketing pour votre programme de fidélité.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="segment">Segment ciblé</Label>
              <Select
                value={formData.targetSegment}
                onValueChange={(value) => setFormData({ ...formData, targetSegment: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un segment" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((segment) => (
                    <SelectItem key={segment.value} value={segment.value}>
                      {segment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Canal</Label>
              <Select
                value={formData.channel}
                onValueChange={(value) => setFormData({ ...formData, channel: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un canal" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.value} value={channel.value}>
                      {channel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerType">Type d&apos;offre</Label>
              <Select
                value={formData.offerType}
                onValueChange={(value) => setFormData({ ...formData, offerType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {offerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={isLoading || !formData.name || !formData.targetSegment || !formData.channel || !formData.offerType}>
              {isLoading ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

