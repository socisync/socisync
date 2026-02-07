'use client'

import * as React from 'react'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

export interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  className?: string
  align?: 'start' | 'center' | 'end'
  showCompare?: boolean
}

const presets = [
  {
    label: 'Today',
    getValue: () => ({
      from: new Date(),
      to: new Date(),
    }),
  },
  {
    label: 'Yesterday',
    getValue: () => ({
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1),
    }),
  },
  {
    label: 'Last 7 days',
    getValue: () => ({
      from: subDays(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    label: 'Last 14 days',
    getValue: () => ({
      from: subDays(new Date(), 13),
      to: new Date(),
    }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      from: subDays(new Date(), 29),
      to: new Date(),
    }),
  },
  {
    label: 'This month',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: new Date(),
    }),
  },
  {
    label: 'Last month',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: 'Last 3 months',
    getValue: () => ({
      from: subMonths(new Date(), 3),
      to: new Date(),
    }),
  },
  {
    label: 'Year to date',
    getValue: () => ({
      from: startOfYear(new Date()),
      to: new Date(),
    }),
  },
]

export function DateRangePicker({
  value,
  onChange,
  className,
  align = 'end',
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<DateRange>(
    value || { from: subDays(new Date(), 29), to: new Date() }
  )

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getValue()
    setInternalValue(range)
    onChange?.(range)
    setOpen(false)
  }

  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      const newRange = {
        from: range.from,
        to: range.to || range.from,
      }
      setInternalValue(newRange)
      if (range.to) {
        onChange?.(newRange)
      }
    }
  }

  const displayValue = React.useMemo(() => {
    if (!internalValue.from) return 'Pick a date range'
    
    const fromStr = format(internalValue.from, 'MMM d, yyyy')
    const toStr = format(internalValue.to, 'MMM d, yyyy')
    
    if (fromStr === toStr) return fromStr
    return `${fromStr} - ${toStr}`
  }, [internalValue])

  // Find matching preset for display
  const matchingPreset = React.useMemo(() => {
    return presets.find(preset => {
      const presetRange = preset.getValue()
      return (
        format(presetRange.from, 'yyyy-MM-dd') === format(internalValue.from, 'yyyy-MM-dd') &&
        format(presetRange.to, 'yyyy-MM-dd') === format(internalValue.to, 'yyyy-MM-dd')
      )
    })
  }, [internalValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal min-w-[200px]',
            !internalValue && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="flex-1">{matchingPreset?.label || displayValue}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex">
          {/* Presets sidebar */}
          <div className="border-r p-2 space-y-1 min-w-[140px]">
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Quick Select</p>
            {presets.map((preset) => {
              const isSelected = matchingPreset?.label === preset.label
              return (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    'w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
          
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={internalValue.from}
              selected={{
                from: internalValue.from,
                to: internalValue.to,
              }}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
            />
            <Separator className="my-3" />
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-muted-foreground">
                {displayValue}
              </p>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
