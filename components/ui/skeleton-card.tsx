'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface SkeletonCardProps {
  variant?: 'metric' | 'chart' | 'list' | 'table'
  className?: string
}

export function SkeletonCard({ variant = 'metric', className }: SkeletonCardProps) {
  if (variant === 'metric') {
    return (
      <div className={cn("bg-card rounded-xl border p-4", className)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="w-14 h-6" />
        </div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-28" />
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <div className={cn("bg-card rounded-xl border p-4", className)}>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="h-64 flex items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="flex-1" 
              style={{ height: `${Math.random() * 60 + 20}%` }} 
            />
          ))}
        </div>
        <div className="flex justify-between mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={cn("bg-card rounded-xl border", className)}>
        <div className="p-4 border-b">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={cn("bg-card rounded-xl border overflow-hidden", className)}>
        <div className="p-4 border-b flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-left"><Skeleton className="h-4 w-24" /></th>
                <th className="p-3 text-left"><Skeleton className="h-4 w-20" /></th>
                <th className="p-3 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="p-3 text-left"><Skeleton className="h-4 w-20" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return null
}

// Full dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-40 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard variant="metric" />
        <SkeletonCard variant="metric" />
        <SkeletonCard variant="metric" />
        <SkeletonCard variant="metric" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonCard variant="chart" />
        <SkeletonCard variant="list" />
      </div>
    </div>
  )
}
