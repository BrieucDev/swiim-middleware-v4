'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Receipt,
  Store,
  Key,
  Users,
  Gift,
  BarChart3,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/accueil', label: 'Accueil', icon: LayoutDashboard },
  { href: '/tickets', label: 'Tickets', icon: Receipt },
  { href: '/magasins', label: 'Magasins', icon: Store },
  { href: '/tpe-cles', label: 'TPE & Clés', icon: Key },
  { href: '/fidelite', label: 'Fidélité', icon: Gift },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/analytique', label: 'Analytique', icon: BarChart3 },
  { href: '/parametres', label: 'Paramètres', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/accueil" className="text-xl font-bold">
            SWIIM
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

