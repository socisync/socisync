'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Save, Loader2, Hash, TrendingUp, BarChart3, PieChart, 
  Table, Eye, EyeOff, GripVertical, Settings, Palette
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

type ViewType = 'number' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'table' | 'hidden'

interface MetricConfig {
  key: string
  label: string
  category: string
  platform: string
  viewType: ViewType
  enabled: boolean
  order: number
}

const VIEW_TYPES = [
  { id: 'number', label: 'Number', icon: Hash },
  { id: 'line_chart', label: 'Line Chart', icon: TrendingUp },
  { id: 'bar_chart', label: 'Bar Chart', icon: BarChart3 },
  { id: 'pie_chart', label: 'Pie Chart', icon: PieChart },
  { id: 'table', label: 'Table', icon: Table },
  { id: 'hidden', label: 'Hidden', icon: EyeOff },
]

const DEFAULT_METRICS: MetricConfig[] = [
  // Facebook
  { key: 'fb_followers', label: 'Followers', category: 'Audience', platform: 'facebook', viewType: 'number', enabled: true, order: 1 },
  { key: 'fb_pageLikes', label: 'Page Likes', category: 'Audience', platform: 'facebook', viewType: 'number', enabled: true, order: 2 },
  { key: 'fb_reach', label: 'Reach', category: 'Reach', platform: 'facebook', viewType: 'line_chart', enabled: true, order: 3 },
  { key: 'fb_impressions', label: 'Impressions', category: 'Reach', platform: 'facebook', viewType: 'bar_chart', enabled: true, order: 4 },
  { key: 'fb_engagements', label: 'Engagements', category: 'Engagement', platform: 'facebook', viewType: 'number', enabled: true, order: 5 },
  { key: 'fb_reactions', label: 'Reactions', category: 'Engagement', platform: 'facebook', viewType: 'pie_chart', enabled: true, order: 6 },
  { key: 'fb_clicks', label: 'Clicks', category: 'Engagement', platform: 'facebook', viewType: 'number', enabled: true, order: 7 },
  { key: 'fb_videoViews', label: 'Video Views', category: 'Video', platform: 'facebook', viewType: 'bar_chart', enabled: true, order: 8 },
  { key: 'fb_newFollowers', label: 'New Followers', category: 'Growth', platform: 'facebook', viewType: 'number', enabled: true, order: 9 },
  
  // Instagram
  { key: 'ig_followers', label: 'Followers', category: 'Audience', platform: 'instagram', viewType: 'number', enabled: true, order: 10 },
  { key: 'ig_reach', label: 'Reach', category: 'Reach', platform: 'instagram', viewType: 'line_chart', enabled: true, order: 11 },
  { key: 'ig_impressions', label: 'Impressions', category: 'Reach', platform: 'instagram', viewType: 'bar_chart', enabled: true, order: 12 },
  { key: 'ig_profileViews', label: 'Profile Views', category: 'Reach', platform: 'instagram', viewType: 'number', enabled: true, order: 13 },
  { key: 'ig_likes', label: 'Likes', category: 'Engagement', platform: 'instagram', viewType: 'number', enabled: true, order: 14 },
  { key: 'ig_comments', label: 'Comments', category: 'Engagement', platform: 'instagram', viewType: 'number', enabled: true, order: 15 },
  { key: 'ig_shares', label: 'Shares', category: 'Engagement', platform: 'instagram', viewType: 'number', enabled: true, order: 16 },
  { key: 'ig_saves', label: 'Saves', category: 'Engagement', platform: 'instagram', viewType: 'number', enabled: true, order: 17 },
  { key: 'ig_websiteClicks', label: 'Website Clicks', category: 'Actions', platform: 'instagram', viewType: 'number', enabled: true, order: 18 },
]

interface ReportSettings {
  layout: 'compact' | 'detailed' | 'visual'
  showComparison: boolean
  showPlatformBreakdown: boolean
  metricsConfig: MetricConfig[]
}

export default function ReportSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [settings, setSettings] = useState<ReportSettings>({
    layout: 'detailed',
    showComparison: true,
    showPlatformBreakdown: true,
    metricsConfig: DEFAULT_METRICS,
  })

  const [activeTab, setActiveTab] = useState<'layout' | 'facebook' | 'instagram'>('layout')

  useEffect(() => {
    loadData()
  }, [router])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: membership } = await supabase
      .from('agency_members')
      .select('agency_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!membership) {
      router.push('/onboarding')
      return
    }

    setAgencyId(membership.agency_id)

    // Load saved settings from agency_settings
    const { data: agencySettings } = await supabase
      .from('agency_settings')
      .select('config')
      .eq('agency_id', membership.agency_id)
      .single()

    if (agencySettings?.config?.reportSettings) {
      setSettings({
        ...settings,
        ...agencySettings.config.reportSettings,
      })
    }

    setLoading(false)
  }

  const saveSettings = async () => {
    if (!agencyId) return
    setSaving(true)
    setMessage(null)

    const supabase = createClient()

    // Get existing settings
    const { data: existing } = await supabase
      .from('agency_settings')
      .select('config')
      .eq('agency_id', agencyId)
      .single()

    const newConfig = {
      ...(existing?.config || {}),
      reportSettings: settings,
    }

    const { error } = await supabase
      .from('agency_settings')
      .upsert({
        agency_id: agencyId,
        config: newConfig,
      }, { onConflict: 'agency_id' })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Report settings saved successfully' })
    }

    setSaving(false)
  }

  const updateMetric = (key: string, updates: Partial<MetricConfig>) => {
    setSettings({
      ...settings,
      metricsConfig: settings.metricsConfig.map(m => 
        m.key === key ? { ...m, ...updates } : m
      ),
    })
  }

  const toggleMetric = (key: string) => {
    updateMetric(key, { enabled: !settings.metricsConfig.find(m => m.key === key)?.enabled })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>
  }

  const facebookMetrics = settings.metricsConfig.filter(m => m.platform === 'facebook')
  const instagramMetrics = settings.metricsConfig.filter(m => m.platform === 'instagram')

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Report Settings</h1>
            <p className="text-slate-500 text-sm">Customize how metrics appear in your reports</p>
          </div>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-4 py-2 border-b-2 font-medium transition ${
            activeTab === 'layout' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Layout</span>
        </button>
        <button
          onClick={() => setActiveTab('facebook')}
          className={`px-4 py-2 border-b-2 font-medium transition ${
            activeTab === 'facebook' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Facebook Metrics
        </button>
        <button
          onClick={() => setActiveTab('instagram')}
          className={`px-4 py-2 border-b-2 font-medium transition ${
            activeTab === 'instagram' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Instagram Metrics
        </button>
      </div>

      {/* Layout Tab */}
      {activeTab === 'layout' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Report Layout</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'compact', label: 'Compact', desc: 'Numbers focused, minimal charts' },
                { id: 'detailed', label: 'Detailed', desc: 'Mix of numbers and charts' },
                { id: 'visual', label: 'Visual', desc: 'Chart-heavy, more graphics' },
              ].map(layout => (
                <button
                  key={layout.id}
                  onClick={() => setSettings({ ...settings, layout: layout.id as any })}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    settings.layout === layout.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-medium text-slate-900">{layout.label}</p>
                  <p className="text-sm text-slate-500">{layout.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Display Options</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Show Comparison to Previous Period</p>
                  <p className="text-sm text-slate-500">Display % change from previous period</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showComparison}
                  onChange={(e) => setSettings({ ...settings, showComparison: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Platform Breakdown</p>
                  <p className="text-sm text-slate-500">Group metrics by platform (Facebook, Instagram, etc.)</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showPlatformBreakdown}
                  onChange={(e) => setSettings({ ...settings, showPlatformBreakdown: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Metrics Tab */}
      {activeTab === 'facebook' && (
        <MetricsConfigPanel 
          metrics={facebookMetrics} 
          onToggle={toggleMetric}
          onUpdateViewType={(key, viewType) => updateMetric(key, { viewType })}
        />
      )}

      {/* Instagram Metrics Tab */}
      {activeTab === 'instagram' && (
        <MetricsConfigPanel 
          metrics={instagramMetrics} 
          onToggle={toggleMetric}
          onUpdateViewType={(key, viewType) => updateMetric(key, { viewType })}
        />
      )}
    </div>
  )
}

function MetricsConfigPanel({ 
  metrics, 
  onToggle, 
  onUpdateViewType 
}: { 
  metrics: MetricConfig[]
  onToggle: (key: string) => void
  onUpdateViewType: (key: string, viewType: ViewType) => void
}) {
  // Group by category
  const byCategory = metrics.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = []
    acc[m.category].push(m)
    return acc
  }, {} as Record<string, MetricConfig[]>)

  return (
    <div className="space-y-6">
      {Object.entries(byCategory).map(([category, categoryMetrics]) => (
        <div key={category} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="font-medium text-slate-900">{category}</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {categoryMetrics.map(metric => (
              <div key={metric.key} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggle(metric.key)}
                    className={`p-1.5 rounded-lg transition ${
                      metric.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {metric.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <span className={metric.enabled ? 'text-slate-900' : 'text-slate-400'}>{metric.label}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {VIEW_TYPES.map(vt => {
                    const Icon = vt.icon
                    const isSelected = metric.viewType === vt.id
                    return (
                      <button
                        key={vt.id}
                        onClick={() => onUpdateViewType(metric.key, vt.id as ViewType)}
                        disabled={!metric.enabled}
                        title={vt.label}
                        className={`p-2 rounded-lg transition ${
                          isSelected
                            ? 'bg-primary-100 text-primary-600'
                            : metric.enabled
                            ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                            : 'text-slate-200 cursor-not-allowed'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
