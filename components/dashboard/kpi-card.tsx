import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface KpiCardProps {
    title: string
    value: string | number
    description?: string
    trend?: number
    trendLabel?: string
    icon?: React.ElementType
    className?: string
}

export function KpiCard({
    title,
    value,
    description,
    trend,
    trendLabel,
    icon: Icon,
    className,
}: KpiCardProps) {
    return (
        <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {title}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-gray-400" />}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
                {(description || trend !== undefined) && (
                    <div className="mt-2 flex items-center text-xs">
                        {trend !== undefined && (
                            <span
                                className={cn(
                                    "flex items-center font-medium mr-2 rounded-full px-1.5 py-0.5",
                                    trend > 0
                                        ? "text-emerald-700 bg-emerald-50"
                                        : trend < 0
                                            ? "text-rose-700 bg-rose-50"
                                            : "text-gray-600 bg-gray-100"
                                )}
                            >
                                {trend > 0 ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3" />
                                ) : trend < 0 ? (
                                    <ArrowDownRight className="mr-1 h-3 w-3" />
                                ) : (
                                    <Minus className="mr-1 h-3 w-3" />
                                )}
                                {Math.abs(trend)}%
                            </span>
                        )}
                        {description && (
                            <span className="text-gray-400">{description}</span>
                        )}
                        {trendLabel && !description && (
                            <span className="text-gray-400">{trendLabel}</span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
