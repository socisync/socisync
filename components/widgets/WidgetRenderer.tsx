'use client'

import { useState, useEffect } from 'react'
import { MoreVertical, Trash2, Move, RefreshCw } from 'lucide-react'
import MetricCard from './MetricCard'
import LineChartWidget from './LineChartWidget'
import BarChartWidget from './BarChartWidget'
import PieChartWidget from './PieChartWidget'
import type { Widget, WidgetData, WidgetSize } from './types'

interface WidgetRendererProps {
  widget: Widget
  dateRange: { from: Date; to: Date }
  onDelete?: (id: string) => void
  onMove?: (id: string, direction: 'up' | 'down') => void
  isEditing?: boolean
}

export default function WidgetRenderer({ widget, dateRange, onDelete, onMove, isEditing }: WidgetRendererProps) {
  const [data, setData] = useState<WidgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    fetchWidgetData()
  }, [widget, dateRange])

  const fetchWidgetData = async () => {
    setLoading(true)
    try {
      // Fetch data from API
      const params = new URLSearchParams({
        account_id: widget.account_id || '',
        metric: widget.metric,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      })
      
      const res = await fetch(`/api/widgets/data?${params}`)
      const json = await res.json()
      
      if (json.data) {
        setData(json.data)
      }
    } catch (err) {
      console.error('Failed to fetch widget data:', err)
      // Set mock data for now
      setData({
        current: Math.floor(Math.random() * 10000),
        previous: Math.floor(Math.random() * 10000),
        change: (Math.random() - 0.5) * 20,
        series: Array.from({ length: 14 }, (_, i) => ({
          date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 1000) + 500,
        })),
      })
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses: Record<WidgetSize, string> = {
    small: 'col-span-1',
    medium: 'col-span-2',
    large: 'col-span-4',
  }

  const renderWidget = () => {
    if (loading || !data) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 h-full flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
        </div>
      )
    }

    const title = widget.title || widget.metric

    switch (widget.widget_type) {
      case 'metric_card':
        return <MetricCard title={title} data={data} size={widget.size} />
      case 'line_chart':
        return <LineChartWidget title={title} data={data} size={widget.size} />
      case 'bar_chart':
        return <BarChartWidget title={title} data={data} size={widget.size} />
      case 'pie_chart':
        return <PieChartWidget title={title} data={data} size={widget.size} />
      default:
        return <div>Unknown widget type</div>
    }
  }

  return (
    <div className={`${sizeClasses[widget.size]} relative group`}>
      {isEditing && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50"
            >
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                  <button
                    onClick={() => { onMove?.(widget.id, 'up'); setShowMenu(false) }}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Move className="w-4 h-4" /> Move up
                  </button>
                  <button
                    onClick={() => { onMove?.(widget.id, 'down'); setShowMenu(false) }}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Move className="w-4 h-4" /> Move down
                  </button>
                  <button
                    onClick={() => fetchWidgetData()}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Refresh
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => { onDelete?.(widget.id); setShowMenu(false) }}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {renderWidget()}
    </div>
  )
}
