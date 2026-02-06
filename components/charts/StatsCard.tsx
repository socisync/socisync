'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { SparklineChart } from './MetricsChart'

interface StatsCardProps {
  label: string
  value: number | string
  change?: number // percentage change
  changeLabel?: string
  icon?: React.ReactNode
  sparklineData?: { date: string; value: number }[]
  color?: string
  formatValue?: (value: number | string) => string
}

export function StatsCard({
  label,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  sparklineData,
  color = '#6366f1',
  formatValue = (v) => typeof v === 'number' ? formatNumber(v) : v
}: StatsCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0
  const isNeutral = change === 0 || change === undefined

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-500">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-slate-500'
          }`}>
            {isPositive && <TrendingUp className="w-4 h-4" />}
            {isNegative && <TrendingDown className="w-4 h-4" />}
            {isNeutral && <Minus className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-slate-900 mb-1">
        {formatValue(value)}
      </div>
      
      {changeLabel && change !== undefined && (
        <div className="text-xs text-slate-500">{changeLabel}</div>
      )}

      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-4 -mx-2">
          <SparklineChart data={sparklineData} color={color} height={50} />
        </div>
      )}
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}
