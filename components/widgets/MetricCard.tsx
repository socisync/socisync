'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { WidgetData, WidgetSize } from './types'

interface MetricCardProps {
  title: string
  data: WidgetData
  size: WidgetSize
  color?: string
}

export default function MetricCard({ title, data, size, color = '#3b82f6' }: MetricCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const change = data.change
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 h-full ${size === 'medium' ? 'flex items-center gap-6' : ''}`}>
      <div className={size === 'medium' ? 'flex-1' : ''}>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{formatNumber(data.current)}</p>
        
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-slate-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : isNegative ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span>{Math.abs(change).toFixed(1)}%</span>
            <span className="text-slate-400">vs prev period</span>
          </div>
        )}
      </div>

      {size === 'medium' && data.previous !== undefined && (
        <div className="text-right">
          <p className="text-xs text-slate-400">Previous</p>
          <p className="text-lg font-semibold text-slate-500">{formatNumber(data.previous)}</p>
        </div>
      )}
    </div>
  )
}
