'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export interface DateRange {
  from: Date
  to: Date
  label: string
}

interface DateRangeSelectorProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const presets = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This month', days: -1 },
  { label: 'Last month', days: -2 },
]

export function getDefaultDateRange(): DateRange {
  return {
    from: subDays(new Date(), 30),
    to: new Date(),
    label: 'Last 30 days'
  }
}

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePresetClick = (preset: typeof presets[0]) => {
    const now = new Date()
    let from: Date
    let to: Date = now

    if (preset.days === -1) {
      // This month
      from = startOfMonth(now)
      to = now
    } else if (preset.days === -2) {
      // Last month
      const lastMonth = subMonths(now, 1)
      from = startOfMonth(lastMonth)
      to = endOfMonth(lastMonth)
    } else if (preset.days === 0) {
      // Today
      from = now
      to = now
    } else {
      from = subDays(now, preset.days)
    }

    onChange({ from, to, label: preset.label })
    setIsOpen(false)
  }

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      const from = new Date(customFrom)
      const to = new Date(customTo)
      if (from <= to) {
        onChange({
          from,
          to,
          label: `${format(from, 'MMM d')} - ${format(to, 'MMM d, yyyy')}`
        })
        setIsOpen(false)
      }
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition text-sm"
      >
        <Calendar className="w-4 h-4 text-slate-500" />
        <span className="text-slate-700">{value.label}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          {/* Presets */}
          <div className="p-2 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-1">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={`px-3 py-1.5 text-sm rounded-md text-left transition ${
                    value.label === preset.label
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Range */}
          <div className="p-3">
            <p className="text-xs text-slate-500 mb-2">Custom range</p>
            <div className="flex gap-2 mb-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-md"
              />
              <span className="text-slate-400 self-center">→</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-md"
              />
            </div>
            <button
              onClick={handleCustomApply}
              disabled={!customFrom || !customTo}
              className="w-full py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
