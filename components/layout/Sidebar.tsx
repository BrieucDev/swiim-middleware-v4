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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-gray-100 px-6">
          <Link href="/accueil" className="text-xl font-bold text-gray-900">
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
                  'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-white')} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

