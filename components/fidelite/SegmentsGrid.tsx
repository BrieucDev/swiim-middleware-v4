'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Segment {
  id: string
  name: string
  customerCount: number
  averageBasket: number
  averageFrequency: number
  revenue30d: number
  loyaltyRate: number
}

interface SegmentsGridProps {
  segments: Segment[]
}

export function SegmentsGrid({ segments }: SegmentsGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
  }

  return (
    <Card className="bg-white/90 border border-gray-100/70 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Segments de clients
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:shadow-md transition-all hover:border-[#C7FF06]/30"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{segment.name}</h3>
                <div className="p-2 rounded-lg bg-[#C7FF06]/20">
                  <Users className="h-4 w-4 text-[#C7FF06]" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Clients</span>
                  <span className="text-lg font-semibold text-gray-900">{segment.customerCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Panier moyen</span>
                  <span className="text-base font-medium text-gray-900">{formatCurrency(segment.averageBasket)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Fréquence</span>
                  <span className="text-base font-medium text-gray-900">{segment.averageFrequency.toFixed(1)} visites</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500">CA 30j</span>
                  <span className="text-base font-semibold text-[#C7FF06]">{formatCurrency(segment.revenue30d)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Membres fidélisés</span>
                  <span className="text-base font-medium text-gray-900">{segment.loyaltyRate.toFixed(0)}%</span>
                </div>
              </div>

              <Link href={`/clients?segment=${segment.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-4 text-[#C7FF06] hover:text-[#C7FF06] hover:bg-[#C7FF06]/10"
                >
                  Voir dans Clients
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}



