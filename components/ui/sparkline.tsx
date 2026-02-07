'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  strokeWidth?: number
  color?: string
  fillOpacity?: number
  className?: string
  showMin?: boolean
  showMax?: boolean
}

export function Sparkline({
  data,
  width = 100,
  height = 24,
  strokeWidth = 1.5,
  color = 'currentColor',
  fillOpacity = 0.1,
  className,
  showMin = false,
  showMax = false,
}: SparklineProps) {
  const { path, fillPath, minPoint, maxPoint } = useMemo(() => {
    if (!data || data.length < 2) return { path: '', fillPath: '', minPoint: null, maxPoint: null }

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    
    const padding = 2
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = padding + chartHeight - ((value - min) / range) * chartHeight
      return { x, y, value }
    })

    // Create smooth curve path using quadratic bezier
    let d = `M ${points[0].x},${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const midX = (prev.x + curr.x) / 2
      d += ` Q ${prev.x},${prev.y} ${midX},${(prev.y + curr.y) / 2}`
    }
    d += ` T ${points[points.length - 1].x},${points[points.length - 1].y}`

    // Fill path (same but closed)
    const fillD = `${d} L ${points[points.length - 1].x},${height - padding} L ${padding},${height - padding} Z`

    // Find min/max points
    let minIdx = 0, maxIdx = 0
    data.forEach((v, i) => {
      if (v < data[minIdx]) minIdx = i
      if (v > data[maxIdx]) maxIdx = i
    })

    return {
      path: d,
      fillPath: fillD,
      minPoint: points[minIdx],
      maxPoint: points[maxIdx],
    }
  }, [data, width, height])

  if (!data || data.length < 2) {
    return <div style={{ width, height }} className={cn('opacity-30', className)}>—</div>
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
    >
      {/* Fill area */}
      <path
        d={fillPath}
        fill={color}
        fillOpacity={fillOpacity}
      />
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Min/Max markers */}
      {showMin && minPoint && (
        <circle cx={minPoint.x} cy={minPoint.y} r={2.5} fill="currentColor" className="text-red-500" />
      )}
      {showMax && maxPoint && (
        <circle cx={maxPoint.x} cy={maxPoint.y} r={2.5} fill="currentColor" className="text-green-500" />
      )}
    </svg>
  )
}
