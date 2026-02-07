'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sparkline } from './sparkline'

interface MetricCardProps {
  title: string
  value: number | string
  change?: number
  changeLabel?: string
  sparklineData?: number[]
  icon?: React.ReactNode
  format?: 'number' | 'percentage' | 'currency' | 'compact'
  prefix?: string
  suffix?: string
  loading?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

function formatValue(value: number | string, format: MetricCardProps['format'], prefix?: string, suffix?: string): string {
  if (typeof value === 'string') return value
  
  let formatted: string
  switch (format) {
    case 'percentage':
      formatted = `${value.toFixed(2)}%`
      break
    case 'currency':
      formatted = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
      break
    case 'compact':
      if (value >= 1000000) formatted = `${(value / 1000000).toFixed(1)}M`
      else if (value >= 1000) formatted = `${(value / 1000).toFixed(1)}K`
      else formatted = value.toLocaleString()
      break
    default:
      formatted = value.toLocaleString()
  }
  
  return `${prefix || ''}${formatted}${suffix || ''}`
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs prev period',
  sparklineData,
  icon,
  format = 'compact',
  prefix,
  suffix,
  loading = false,
  className,
  variant = 'default',
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change !== undefined && Math.abs(change) < 0.1

  if (loading) {
    return (
      <div className={cn(
        "bg-card rounded-xl border p-4",
        variant === 'compact' && "p-3",
        className
      )}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn("bg-card rounded-lg border p-3 flex items-center justify-between", className)}>
        <div className="flex items-center gap-2">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">{formatValue(value, format, prefix, suffix)}</span>
          {change !== undefined && (
            <span className={cn(
              "text-sm flex items-center gap-0.5",
              isPositive && "text-green-600",
              isNegative && "text-red-500",
              isNeutral && "text-muted-foreground"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : null}
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-card rounded-xl border p-4 transition-shadow hover:shadow-md",
      variant === 'detailed' && "p-5",
      className
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              {icon}
            </div>
          )}
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        {sparklineData && sparklineData.length > 1 && (
          <Sparkline
            data={sparklineData}
            width={60}
            height={24}
            color={isPositive ? '#22c55e' : isNegative ? '#ef4444' : '#94a3b8'}
            strokeWidth={1.5}
          />
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold tracking-tight">
            {formatValue(value, format, prefix, suffix)}
          </p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-1 text-sm",
              isPositive && "text-green-600",
              isNegative && "text-red-500",
              isNeutral && "text-muted-foreground"
            )}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : isNegative ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-muted-foreground">{changeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Grid wrapper for metric cards
interface MetricGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4 | 5
  className?: string
}

export function MetricGrid({ children, columns = 4, className }: MetricGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  }
  
  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  )
}
