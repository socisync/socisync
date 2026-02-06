'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import type { WidgetData, WidgetSize } from './types'

interface LineChartWidgetProps {
  title: string
  data: WidgetData
  size: WidgetSize
  color?: string
}

export default function LineChartWidget({ title, data, size, color = '#3b82f6' }: LineChartWidgetProps) {
  const chartData = data.series?.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM d'),
  })) || []

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  const height = size === 'large' ? 300 : 200

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{formatNumber(data.current)}</p>
        </div>
        {data.change !== undefined && (
          <span className={`text-sm px-2 py-0.5 rounded-full ${
            data.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(1)}%
          </span>
        )}
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value) => [formatNumber(value as number), title]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
