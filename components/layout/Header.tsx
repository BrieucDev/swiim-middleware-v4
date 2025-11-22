'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DemoDataButton } from '@/components/demo-data-button'

export function Header({ stores }: { stores: Array<{ id: string; name: string }> }) {
  const [selectedStore, setSelectedStore] = useState<string>('all')

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-8">
      <div className="flex items-center gap-4">
        <Select value={selectedStore} onValueChange={setSelectedStore}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les magasins" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les magasins</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium">Admin Swiim</div>
          <div className="text-xs text-muted-foreground">Pilote enseigne</div>
        </div>
        <Avatar>
          <AvatarFallback>AS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

