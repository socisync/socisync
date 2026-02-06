'use client'

import { useState } from 'react'
import { X, Facebook, Instagram, Linkedin, Youtube, Music2, Hash, TrendingUp, BarChart3, PieChart, ChevronRight, ChevronLeft } from 'lucide-react'
import { METRICS, WIDGET_TYPES, WIDGET_SIZES, type WidgetType, type WidgetSize, type Platform } from './types'

interface ConnectedAccount {
  id: string
  platform: string
  platform_account_id: string
  platform_account_name: string | null
  platform_account_type: string | null
}

interface AddWidgetModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (widget: {
    widget_type: WidgetType
    platform: Platform
    account_id: string | null
    metric: string
    size: WidgetSize
    title: string
  }) => void
  accounts: ConnectedAccount[]
}

const PLATFORM_ICONS: Record<string, any> = {
  meta: Facebook,
  facebook_page: Facebook,
  instagram_business: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music2,
}

const WIDGET_ICONS: Record<string, any> = {
  metric_card: Hash,
  line_chart: TrendingUp,
  bar_chart: BarChart3,
  pie_chart: PieChart,
}

export default function AddWidgetModal({ isOpen, onClose, onAdd, accounts }: AddWidgetModalProps) {
  const [step, setStep] = useState(1)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<ConnectedAccount | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null)
  const [selectedSize, setSelectedSize] = useState<WidgetSize>('small')
  const [customTitle, setCustomTitle] = useState('')

  if (!isOpen) return null

  const resetModal = () => {
    setStep(1)
    setSelectedPlatform(null)
    setSelectedAccount(null)
    setSelectedMetric(null)
    setSelectedType(null)
    setSelectedSize('small')
    setCustomTitle('')
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  // Get unique platforms from connected accounts
  const availablePlatforms = Array.from(new Set(accounts.map(a => a.platform)))

  // Get accounts for selected platform
  const filteredAccounts = accounts.filter(a => a.platform === selectedPlatform)

  // Get metrics for selected account type
  const getMetrics = (): { key: string; label: string; category: string }[] => {
    if (!selectedAccount) return []
    const accountType = selectedAccount.platform_account_type
    
    if (selectedPlatform === 'meta') {
      if (accountType === 'instagram_business') {
        return METRICS.meta.instagram
      }
      return METRICS.meta.facebook
    }
    const platformMetrics = METRICS[selectedPlatform as keyof typeof METRICS]
    if (Array.isArray(platformMetrics)) {
      return platformMetrics
    }
    return []
  }

  // Get available widget types for selected metric
  const getWidgetTypes = () => {
    return WIDGET_TYPES
  }

  // Get available sizes for selected widget type
  const getAvailableSizes = () => {
    const widgetConfig = WIDGET_TYPES.find(w => w.key === selectedType)
    return widgetConfig?.sizes || ['small']
  }

  const handleAdd = () => {
    if (!selectedAccount || !selectedMetric || !selectedType) return

    const metrics = getMetrics()
    const metricConfig = (metrics as any[]).find((m: any) => m.key === selectedMetric)
    const title = customTitle || metricConfig?.label || selectedMetric

    onAdd({
      widget_type: selectedType,
      platform: selectedPlatform as Platform,
      account_id: selectedAccount.id,
      metric: selectedMetric,
      size: selectedSize,
      title,
    })

    handleClose()
  }

  const canProceed = () => {
    switch (step) {
      case 1: return selectedPlatform !== null
      case 2: return selectedAccount !== null
      case 3: return selectedMetric !== null
      case 4: return selectedType !== null
      case 5: return true
      default: return false
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Add Widget</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {['Source', 'Account', 'Metric', 'Type', 'Size'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded ${
                  step > i + 1 ? 'bg-green-100 text-green-700' :
                  step === i + 1 ? 'bg-primary-100 text-primary-700' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {i + 1}. {label}
                </span>
                {i < 4 && <ChevronRight className="w-3 h-3 text-slate-300" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Step 1: Select Platform */}
          {step === 1 && (
            <div>
              <p className="text-sm text-slate-600 mb-4">Select the data source for this widget</p>
              <div className="grid grid-cols-2 gap-3">
                {availablePlatforms.map(platform => {
                  const Icon = PLATFORM_ICONS[platform] || Facebook
                  const accountCount = accounts.filter(a => a.platform === platform).length
                  return (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`p-4 rounded-lg border-2 text-left transition ${
                        selectedPlatform === platform
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-2 text-slate-700" />
                      <p className="font-medium text-slate-900 capitalize">{platform}</p>
                      <p className="text-xs text-slate-500">{accountCount} account{accountCount !== 1 ? 's' : ''}</p>
                    </button>
                  )
                })}
              </div>
              {availablePlatforms.length === 0 && (
                <p className="text-center text-slate-500 py-8">No accounts connected yet</p>
              )}
            </div>
          )}

          {/* Step 2: Select Account */}
          {step === 2 && (
            <div>
              <p className="text-sm text-slate-600 mb-4">Select the account to pull data from</p>
              <div className="space-y-2">
                {filteredAccounts.map(account => {
                  const Icon = PLATFORM_ICONS[account.platform_account_type || account.platform] || Facebook
                  return (
                    <button
                      key={account.id}
                      onClick={() => setSelectedAccount(account)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition flex items-center gap-3 ${
                        selectedAccount?.id === account.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-8 h-8 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">{account.platform_account_name || 'Unnamed'}</p>
                        <p className="text-xs text-slate-500 capitalize">{account.platform_account_type?.replace('_', ' ')}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Select Metric */}
          {step === 3 && (
            <div>
              <p className="text-sm text-slate-600 mb-4">Select the metric to display</p>
              <div className="space-y-4">
                {Object.entries(
                  (getMetrics() as any[]).reduce((acc: Record<string, any[]>, metric: any) => {
                    if (!acc[metric.category]) acc[metric.category] = []
                    acc[metric.category].push(metric)
                    return acc
                  }, {})
                ).map(([category, metrics]) => (
                  <div key={category}>
                    <p className="text-xs font-medium text-slate-400 uppercase mb-2">{category}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(metrics as any[]).map((metric: any) => (
                        <button
                          key={metric.key}
                          onClick={() => setSelectedMetric(metric.key)}
                          className={`p-3 rounded-lg border text-left text-sm transition ${
                            selectedMetric === metric.key
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {metric.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Select Widget Type */}
          {step === 4 && (
            <div>
              <p className="text-sm text-slate-600 mb-4">How do you want to visualize this data?</p>
              <div className="grid grid-cols-2 gap-3">
                {getWidgetTypes().map(type => {
                  const Icon = WIDGET_ICONS[type.key]
                  return (
                    <button
                      key={type.key}
                      onClick={() => {
                        setSelectedType(type.key as WidgetType)
                        // Set default size
                        setSelectedSize(type.sizes[0] as WidgetSize)
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition ${
                        selectedType === type.key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-2 text-slate-700" />
                      <p className="font-medium text-slate-900">{type.label}</p>
                      <p className="text-xs text-slate-500">
                        {type.sizes.map(s => WIDGET_SIZES[s as WidgetSize].label.split(' ')[0]).join(', ')}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 5: Size & Title */}
          {step === 5 && (
            <div>
              <p className="text-sm text-slate-600 mb-4">Configure the widget</p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Widget Size</label>
                <div className="flex gap-2">
                  {getAvailableSizes().map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size as WidgetSize)}
                      className={`flex-1 p-3 rounded-lg border-2 text-center transition ${
                        selectedSize === size
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-medium text-slate-900 capitalize">{size}</p>
                      <p className="text-xs text-slate-500">{WIDGET_SIZES[size as WidgetSize].label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Custom Title (optional)</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={getMetrics().find((m: any) => m.key === selectedMetric)?.label || 'Widget title'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {step > 1 ? 'Back' : 'Cancel'}
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add Widget
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
