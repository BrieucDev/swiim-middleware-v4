'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TicketsChartProps {
  data: Array<{ date: string; count: number; revenue: number }>
}

export function TicketsChart({ data }: TicketsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C7FF06" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#C7FF06" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
        <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
        <YAxis stroke="#6B7280" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="#C7FF06" 
          strokeWidth={2}
          fill="url(#colorCount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

