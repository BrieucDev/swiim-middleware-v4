import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface LoyaltyKpiCardProps {
  title: string
  value: string | number
  description?: string
  trend?: number
  icon?: LucideIcon
  className?: string
}

export function LoyaltyKpiCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  className,
}: LoyaltyKpiCardProps) {
  return (
    <Card className={cn(
      "bg-white/90 border border-gray-100/70 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {Icon && (
                <div className="p-2 rounded-lg bg-gray-50">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
              )}
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {title}
              </p>
            </div>
            <p className="text-3xl font-semibold text-gray-900 tracking-tight">
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-400">{description}</p>
            )}
            {trend !== undefined && (
              <div className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend >= 0 ? "text-[#C7FF06]" : "text-gray-500"
              )}>
                <span>{trend >= 0 ? '↑' : '↓'}</span>
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



