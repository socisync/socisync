'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Facebook, Instagram, Linkedin, Youtube, Music2,
  Pencil, Settings, LayoutGrid, Filter, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import DateRangeSelector, { getDefaultDateRange, type DateRange } from '@/components/DateRangeSelector'
import AddWidgetModal from '@/components/widgets/AddWidgetModal'
import WidgetRenderer from '@/components/widgets/WidgetRenderer'
import type { Widget } from '@/components/widgets/types'

interface Client {
  id: string
  name: string
  website: string | null
  industry: string | null
  is_active: boolean
}

interface ConnectedAccount {
  id: string
  platform: string
  platform_account_id: string
  platform_account_name: string | null
  platform_account_type: string | null
  is_active: boolean
}

interface Dashboard {
  id: string
  client_id: string
  name: string
}

const platformIcons: Record<string, any> = {
  meta: Facebook,
  facebook_page: Facebook,
  instagram_business: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music2,
}

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const clientId = params.id as string
  const justConnected = searchParams.get('connected')
  
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<Client | null>(null)
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange())
  const [isEditing, setIsEditing] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [showConnectMenu, setShowConnectMenu] = useState(false)
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(
    justConnected ? `Successfully connected ${justConnected}!` : null
  )

  useEffect(() => {
    loadData()
  }, [clientId])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const loadData = async () => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Get client
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (!clientData) {
      router.push('/dashboard/clients')
      return
    }
    setClient(clientData)

    // Get connected accounts
    const { data: accountsData } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('client_id', clientId)
      .order('platform')

    setAccounts(accountsData || [])
    setLoading(false)

    // Load widgets
    loadWidgets()
  }

  const loadWidgets = async () => {
    try {
      const res = await fetch(`/api/widgets?client_id=${clientId}`)
      const data = await res.json()
      if (data.dashboard) setDashboard(data.dashboard)
      if (data.widgets) setWidgets(data.widgets)
    } catch (err) {
      console.error('Failed to load widgets:', err)
    }
  }

  const handleAddWidget = async (widgetConfig: any) => {
    if (!dashboard) return

    try {
      const res = await fetch('/api/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboard_id: dashboard.id,
          ...widgetConfig,
        }),
      })
      const data = await res.json()
      if (data.widget) {
        setWidgets([...widgets, data.widget])
      }
    } catch (err) {
      console.error('Failed to add widget:', err)
    }
  }

  const handleDeleteWidget = async (widgetId: string) => {
    try {
      await fetch(`/api/widgets?id=${widgetId}`, { method: 'DELETE' })
      setWidgets(widgets.filter(w => w.id !== widgetId))
    } catch (err) {
      console.error('Failed to delete widget:', err)
    }
  }

  const handleMoveWidget = async (widgetId: string, direction: 'up' | 'down') => {
    const index = widgets.findIndex(w => w.id === widgetId)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= widgets.length) return

    const newWidgets = [...widgets]
    const [moved] = newWidgets.splice(index, 1)
    newWidgets.splice(newIndex, 0, moved)

    // Update positions
    const updates = newWidgets.map((w, i) => ({ id: w.id, position: i }))
    setWidgets(newWidgets)

    // Persist
    for (const update of updates) {
      await fetch('/api/widgets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      })
    }
  }

  // OAuth connection functions
  const connectMeta = () => {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID || '912349961253093'
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/meta`)
    const scope = encodeURIComponent('pages_show_list,pages_read_engagement,pages_read_user_content,read_insights,instagram_basic,instagram_manage_insights,business_management')
    window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&state=${clientId}&response_type=code`
  }

  const connectLinkedIn = () => {
    const clientIdEnv = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID
    if (!clientIdEnv) { alert('LinkedIn not configured'); return }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/linkedin`)
    const scope = encodeURIComponent('r_organization_admin rw_organization_admin r_organization_social')
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientIdEnv}&redirect_uri=${redirectUri}&scope=${scope}&state=${clientId}`
  }

  const connectYouTube = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!googleClientId) { alert('YouTube not configured'); return }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/youtube`)
    const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly')
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${clientId}`
  }

  // Filter widgets by platform
  const filteredWidgets = filterPlatform 
    ? widgets.filter(w => w.platform === filterPlatform)
    : widgets

  // Get unique platforms from accounts
  const platforms = Array.from(new Set(accounts.map(a => a.platform)))

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>
  }

  if (!client) return <div>Client not found</div>

  return (
    <div>
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          ✓ {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-slate-600">{client.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
              <p className="text-sm text-slate-500">{accounts.length} connected account{accounts.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Link href={`/dashboard/clients/${clientId}/edit`} className="text-slate-400 hover:text-slate-600">
            <Pencil className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition ${
              showFilters || filterPlatform ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-lg border transition ${
              isEditing ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">Filter by platform:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterPlatform(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    !filterPlatform ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {platforms.map(platform => {
                  const Icon = platformIcons[platform] || Facebook
                  return (
                    <button
                      key={platform}
                      onClick={() => setFilterPlatform(platform)}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition ${
                        filterPlatform === platform ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{platform}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            {filterPlatform && (
              <button onClick={() => setFilterPlatform(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Connected Accounts Strip */}
      {accounts.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {accounts.map(account => {
            const Icon = platformIcons[account.platform_account_type || account.platform] || Facebook
            return (
              <div
                key={account.id}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm whitespace-nowrap"
              >
                <Icon className="w-4 h-4 text-slate-600" />
                <span className="text-slate-700">{account.platform_account_name || 'Unnamed'}</span>
              </div>
            )
          })}
          <div className="relative">
            <button
              onClick={() => setShowConnectMenu(!showConnectMenu)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Connect
            </button>
            {showConnectMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowConnectMenu(false)} />
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                  <button onClick={connectMeta} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" /> Facebook / Instagram
                  </button>
                  <button onClick={connectLinkedIn} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-sky-600" /> LinkedIn
                  </button>
                  <button onClick={connectYouTube} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-600" /> YouTube
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Widgets Grid */}
      {filteredWidgets.length > 0 ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {filteredWidgets.map(widget => (
            <WidgetRenderer
              key={widget.id}
              widget={widget}
              dateRange={dateRange}
              onDelete={handleDeleteWidget}
              onMove={handleMoveWidget}
              isEditing={isEditing}
            />
          ))}
        </div>
      ) : accounts.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center mb-6">
          <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-medium text-slate-900 mb-2">No widgets yet</h3>
          <p className="text-slate-500 text-sm mb-4">Add widgets to build your custom dashboard</p>
          <button
            onClick={() => setShowAddWidget(true)}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="w-4 h-4" /> Add First Widget
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Facebook className="w-5 h-5 text-blue-600" />
            </div>
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Instagram className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <h3 className="font-medium text-slate-900 mb-2">Connect your first account</h3>
          <p className="text-slate-500 text-sm mb-4">Connect social accounts to start building your dashboard</p>
          <button
            onClick={() => setShowConnectMenu(true)}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="w-4 h-4" /> Connect Account
          </button>
        </div>
      )}

      {/* Add Widget FAB */}
      {accounts.length > 0 && (
        <button
          onClick={() => setShowAddWidget(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={showAddWidget}
        onClose={() => setShowAddWidget(false)}
        onAdd={handleAddWidget}
        accounts={accounts}
      />
    </div>
  )
}
