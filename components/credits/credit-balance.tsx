'use client'

import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CreditBalanceProps {
  current: number
  total: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CreditBalance({
  current,
  total,
  showLabel = true,
  size = 'md',
  className,
}: CreditBalanceProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0
  const isLow = percentage < 20
  const isCritical = percentage < 10

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2',
    lg: 'text-base gap-2',
  }

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center rounded-lg px-3 py-1.5 transition-colors hover:bg-muted',
            isCritical && 'text-red-600 bg-red-50 hover:bg-red-100',
            isLow && !isCritical && 'text-amber-600 bg-amber-50 hover:bg-amber-100',
            !isLow && 'text-muted-foreground',
            sizeClasses[size],
            className
          )}
        >
          <Zap className={cn(iconSize[size], isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-primary')} />
          <span className="font-medium">{current.toLocaleString()}</span>
          {showLabel && <span className="text-muted-foreground">credits</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Credit Balance</h4>
            <span className={cn(
              "text-sm font-medium",
              isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-green-600'
            )}>
              {Math.round(percentage)}% remaining
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={percentage} 
              className={cn(
                "h-2",
                isCritical && "[&>div]:bg-red-500",
                isLow && !isCritical && "[&>div]:bg-amber-500"
              )} 
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{current.toLocaleString()} used</span>
              <span>{total.toLocaleString()} total</span>
            </div>
          </div>

          {isCritical && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <strong>Low balance!</strong> You&apos;re running low on credits. Top up to continue using AI features.
            </div>
          )}

          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link href="/dashboard/settings/credits">View Usage</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="flex-1">
              <Link href="/dashboard/settings/credits?action=topup">Top Up</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Resets on the 1st of each month
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Mini version for sidebar/header
export function CreditBalanceMini({ current, total }: { current: number; total: number }) {
  const percentage = total > 0 ? (current / total) * 100 : 0
  const isLow = percentage < 20

  return (
    <Link
      href="/dashboard/settings/credits"
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
        isLow ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-muted hover:bg-muted/80'
      )}
    >
      <Zap className={cn("w-4 h-4", isLow ? 'text-amber-500' : 'text-primary')} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">{current.toLocaleString()}</span>
          <span className="text-muted-foreground">/ {total.toLocaleString()}</span>
        </div>
        <Progress 
          value={percentage} 
          className={cn("h-1 mt-1", isLow && "[&>div]:bg-amber-500")} 
        />
      </div>
    </Link>
  )
}
