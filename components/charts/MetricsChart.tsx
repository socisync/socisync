'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface DataPoint {
  date: string
  value: number
  label?: string
}

interface MetricsChartProps {
  data: DataPoint[]
  color?: string
  type?: 'line' | 'area'
  height?: number
  showGrid?: boolean
  formatValue?: (value: number) => string
}

export function MetricsChart({ 
  data, 
  color = '#6366f1', 
  type = 'area',
  height = 300,
  showGrid = true,
  formatValue = (v) => v.toLocaleString()
}: MetricsChartProps) {
  const Chart = type === 'area' ? AreaChart : LineChart
  const DataElement = type === 'area' ? Area : Line

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatValue}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value) => [formatValue(value as number), 'Value']}
        />
        {type === 'area' ? (
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            fill={color}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        ) : (
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        )}
      </Chart>
    </ResponsiveContainer>
  )
}

// Compact sparkline version
export function SparklineChart({ data, color = '#6366f1', height = 60 }: { data: DataPoint[], color?: string, height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
