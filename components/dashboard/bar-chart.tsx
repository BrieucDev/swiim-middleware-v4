'use client'

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/format'

interface BarChartProps {
  data: Array<Record<string, string | number>>
  dataKey?: string
  nameKey?: string
  height?: number
  formatValue?: (value: number) => string
  color?: string
}

export function BarChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  formatValue = (v) => formatCurrency(v),
  color = '#C7FF06',
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
        <XAxis
          dataKey={nameKey}
          angle={-45}
          textAnchor="end"
          height={100}
          stroke="#6B7280"
          fontSize={12}
        />
        <YAxis stroke="#6B7280" fontSize={12} />
        <Tooltip
          formatter={(value: number) => formatValue(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

