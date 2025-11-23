import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <Card className={cn(
      "bg-white/90 border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]",
      className
    )}>
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-gray-500 mt-1">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {children}
      </CardContent>
    </Card>
  )
}

