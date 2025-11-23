'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/format'

interface RevenueChartProps {
  data: Array<{ date: string; count: number; revenue: number }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
        <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
        <YAxis stroke="#6B7280" fontSize={12} />
        <Tooltip 
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#C7FF06" 
          strokeWidth={2}
          dot={{ fill: '#C7FF06', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

