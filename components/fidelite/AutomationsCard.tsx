'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Settings } from 'lucide-react'
import { useState } from 'react'

interface Automation {
  id: string
  name: string
  description: string
  enabled: boolean
  config?: any
}

interface AutomationsCardProps {
  automations: Automation[]
  onToggle: (id: string, enabled: boolean) => Promise<void>
  onConfigure: (id: string) => void
}

export function AutomationsCard({ automations, onToggle, onConfigure }: AutomationsCardProps) {
  return (
    <Card className="bg-white/90 border border-gray-100/70 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Automatisations
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-4">
          {automations.map((automation) => (
            <div
              key={automation.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium text-gray-900">{automation.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onConfigure(automation.id)}
                    className="h-7 px-2 text-xs text-gray-500 hover:text-gray-900"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Configurer
                  </Button>
                </div>
                <p className="text-sm text-gray-500">{automation.description}</p>
              </div>
              <Switch
                checked={automation.enabled}
                onCheckedChange={(checked) => onToggle(automation.id, checked)}
                className="data-[state=checked]:bg-[#C7FF06]"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}



