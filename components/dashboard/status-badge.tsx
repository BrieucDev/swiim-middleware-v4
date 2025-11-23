import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type TicketStatus = 'EMIS' | 'RECLAME' | 'REMBOURSE' | 'ANNULE' | 'ACTIF' | 'INACTIF' | 'PROGRAMMEE' | 'TERMINEE' | 'BROUILLON'

interface StatusBadgeProps {
    status: string
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const normalizedStatus = status.toUpperCase() as TicketStatus

    const styles: Record<string, string> = {
        EMIS: "bg-gray-100 text-gray-700 border-gray-200",
        RECLAME: "bg-white text-gray-900 border-[#C7FF06] border-2",
        REMBOURSE: "bg-blue-50 text-blue-700 border-blue-200",
        ANNULE: "bg-red-50 text-red-700 border-red-200",
        ACTIF: "bg-emerald-50 text-emerald-700 border-emerald-200",
        INACTIF: "bg-gray-100 text-gray-500 border-gray-200",
        PROGRAMMEE: "bg-amber-50 text-amber-700 border-amber-200",
        TERMINEE: "bg-emerald-50 text-emerald-700 border-emerald-200",
        BROUILLON: "bg-gray-50 text-gray-500 border-gray-200 border-dashed",
    }

    const defaultStyle = "bg-gray-100 text-gray-700 border-gray-200"

    return (
        <Badge
            variant="outline"
            className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border",
                styles[normalizedStatus] || defaultStyle,
                className
            )}
        >
            {status}
        </Badge>
    )
}
