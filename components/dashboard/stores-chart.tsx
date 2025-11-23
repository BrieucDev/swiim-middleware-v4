'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/format'

interface StorePerformance {
  id: string
  name: string
  count: number
  revenue: number
  claimedRate: number
}

interface StoresChartProps {
  data: StorePerformance[]
}

export function StoresChart({ data }: StoresChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} stroke="#6B7280" fontSize={12} />
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
        <Bar dataKey="revenue" fill="#C7FF06" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

