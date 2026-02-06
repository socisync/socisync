'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Facebook, Instagram, Linkedin, Youtube, Music2, RefreshCw, 
  Users, Eye, ThumbsUp, TrendingUp, Pencil, MessageCircle, Share2, Bookmark,
  MousePointer, Heart, Play, UserPlus, Globe, Mail, Phone, MapPin, BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Client {
  id: string
  name: string
  website: string | null
  industry: string | null
  notes: string | null
  is_active: boolean
}

interface ConnectedAccount {
  id: string
  platform: string
  platform_account_id: string
  platform_account_name: string | null
  platform_account_type: string | null
  is_active: boolean
  last_synced_at: string | null
}

interface FacebookInsights {
  followers: number
  pageLikes: number
  pageViews: number
  reach: number
  impressions: number
  postReach: number
  postImpressions: number
  engagements: number
  engagedUsers: number
  reactions: number
  clicks: number
  videoViews: number
  newLikes: number
  unlikes: number
  newFollowers: number
  negativeActions: number
  period: string
}

interface InstagramInsights {
  followers: number
  following: number
  mediaCount: number
  reach: number
  impressions: number
  profileViews: number
  accountsEngaged: number
  totalInteractions: number
  likes: number
  comments: number
  shares: number
  saves: number
  replies: number
  websiteClicks: number
  emailContacts: number
  phoneClicks: number
  getDirectionsClicks: number
  followerCount: number
  period: string
}

type Insights = FacebookInsights | InstagramInsights

const platformIcons: Record<string, any> = {
  meta: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music2,
}

const platformColors: Record<string, string> = {
  meta: 'bg-blue-100 text-blue-600',
  linkedin: 'bg-sky-100 text-sky-600',
  youtube: 'bg-red-100 text-red-600',
  tiktok: 'bg-slate-100 text-slate-600',
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
  const [insights, setInsights] = useState<Record<string, { insights: Insights, account_type: string }>>({})
  const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({})
  const [showConnectMenu, setShowConnectMenu] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(
    justConnected ? `Successfully connected ${justConnected}!` : null
  )

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

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

      const { data: accountsData } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('client_id', clientId)
        .order('platform')

      setAccounts(accountsData || [])
      setLoading(false)

      if (accountsData && accountsData.length > 0) {
        for (const account of accountsData) {
          fetchInsights(account.id, account.platform)
        }
      }
    }

    loadData()
  }, [clientId, router])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const fetchInsights = async (accountId: string, platform: string) => {
    setLoadingInsights(prev => ({ ...prev, [accountId]: true }))
    
    try {
      let endpoint = `/api/insights/meta?account_id=${accountId}&include=all`
      if (platform === 'linkedin') {
        endpoint = `/api/insights/linkedin?account_id=${accountId}`
      } else if (platform === 'youtube') {
        endpoint = `/api/insights/youtube?account_id=${accountId}`
      } else if (platform === 'tiktok') {
        endpoint = `/api/insights/tiktok?account_id=${accountId}`
      }
      
      const res = await fetch(endpoint)
      const data = await res.json()
      
      if (data.insights) {
        setInsights(prev => ({ ...prev, [accountId]: data }))
      }
    } catch (err) {
      console.error('Failed to fetch insights:', err)
    } finally {
      setLoadingInsights(prev => ({ ...prev, [accountId]: false }))
    }
  }

  const connectMeta = () => {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID || '912349961253093'
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/meta`)
    const scope = encodeURIComponent('pages_show_list,pages_read_engagement,pages_read_user_content,read_insights,instagram_basic,instagram_manage_insights,business_management')
    const state = clientId
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_type=code`
    
    window.location.href = authUrl
  }

  const connectLinkedIn = () => {
    const clientIdEnv = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID
    if (!clientIdEnv) {
      alert('LinkedIn integration not configured yet')
      return
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/linkedin`)
    const scope = encodeURIComponent('r_organization_admin rw_organization_admin r_organization_social')
    const state = clientId
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientIdEnv}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`
    
    window.location.href = authUrl
  }

  const connectYouTube = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!googleClientId) {
      alert('YouTube integration not configured yet')
      return
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/youtube`)
    const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly')
    const state = clientId
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`
    
    window.location.href = authUrl
  }

  const connectTikTok = () => {
    const tiktokAppId = process.env.NEXT_PUBLIC_TIKTOK_APP_ID
    if (!tiktokAppId) {
      alert('TikTok integration not configured yet')
      return
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/tiktok`)
    const state = clientId
    
    const authUrl = `https://business-api.tiktok.com/portal/auth?app_id=${tiktokAppId}&redirect_uri=${redirectUri}&state=${state}`
    
    window.location.href = authUrl
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>
  }

  if (!client) {
    return <div>Client not found</div>
  }

  return (
    <div>
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          ✓ {successMessage}
        </div>
      )}

      <Link 
        href="/dashboard/clients"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Link>

      {/* Client Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-slate-600">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
              <Link 
                href={`/dashboard/clients/${clientId}/edit`}
                className="text-slate-400 hover:text-slate-600"
              >
                <Pencil className="w-4 h-4" />
              </Link>
            </div>
            {client.website && (
              <a 
                href={client.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                {client.website}
              </a>
            )}
            <div className="flex gap-4 mt-2 text-sm text-slate-500">
              {client.industry && (
                <span className="capitalize">{client.industry}</span>
              )}
              <span className={client.is_active ? 'text-green-600' : 'text-slate-400'}>
                {client.is_active ? '● Active' : '○ Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-semibold text-slate-900">Connected Accounts</h2>
          <div className="relative">
            <button 
              onClick={() => setShowConnectMenu(!showConnectMenu)}
              className="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Connect Account
            </button>
            
            {showConnectMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowConnectMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20">
                  <button onClick={connectMeta} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Facebook className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Facebook / Instagram</div>
                      <div className="text-xs text-slate-500">Pages & Business accounts</div>
                    </div>
                  </button>
                  <button onClick={connectLinkedIn} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                      <Linkedin className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">LinkedIn</div>
                      <div className="text-xs text-slate-500">Company pages</div>
                    </div>
                  </button>
                  <button onClick={connectYouTube} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Youtube className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">YouTube</div>
                      <div className="text-xs text-slate-500">Channels & analytics</div>
                    </div>
                  </button>
                  <button onClick={connectTikTok} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                      <Music2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">TikTok Ads</div>
                      <div className="text-xs text-slate-500">Ad account reporting</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {accounts.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {accounts.map((account) => {
              const Icon = account.platform_account_type === 'instagram_business' ? Instagram : platformIcons[account.platform] || Facebook
              const colorClass = account.platform_account_type === 'instagram_business' ? 'bg-pink-100 text-pink-600' : platformColors[account.platform] || 'bg-slate-100 text-slate-600'
              const accountData = insights[account.id]
              const isLoadingInsights = loadingInsights[account.id]
              
              return (
                <div key={account.id} className="p-6">
                  {/* Account Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {account.platform_account_name || 'Unnamed Account'}
                        </div>
                        <div className="text-sm text-slate-500 capitalize">
                          {account.platform_account_type?.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => fetchInsights(account.id, account.platform)}
                      disabled={isLoadingInsights}
                      className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingInsights ? 'animate-spin' : ''}`} />
                      {isLoadingInsights ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>

                  {/* Insights */}
                  {accountData?.insights ? (
                    account.platform_account_type === 'instagram_business' ? (
                      <InstagramInsightsGrid insights={accountData.insights as InstagramInsights} />
                    ) : (
                      <FacebookInsightsGrid insights={accountData.insights as FacebookInsights} />
                    )
                  ) : isLoadingInsights ? (
                    <div className="text-center py-8 text-slate-400">Loading insights...</div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">Click refresh to load insights</div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Facebook className="w-5 h-5 text-blue-600" />
              </div>
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Instagram className="w-5 h-5 text-pink-600" />
              </div>
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-sky-600" />
              </div>
            </div>
            <h3 className="font-medium text-slate-900 mb-1">No accounts connected</h3>
            <p className="text-slate-500 text-sm mb-4">
              Connect social accounts to start pulling analytics
            </p>
            <button 
              onClick={() => setShowConnectMenu(true)}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-4 h-4" /> Connect First Account
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function FacebookInsightsGrid({ insights }: { insights: FacebookInsights }) {
  return (
    <div className="space-y-6">
      {/* Audience */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Audience
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Followers" value={insights.followers} icon={<Users className="w-4 h-4" />} />
          <MetricCard label="Page Likes" value={insights.pageLikes} icon={<ThumbsUp className="w-4 h-4" />} />
          <MetricCard label="New Likes" value={insights.newLikes} icon={<UserPlus className="w-4 h-4" />} color="green" />
          <MetricCard label="New Followers" value={insights.newFollowers} icon={<UserPlus className="w-4 h-4" />} color="green" />
        </div>
      </div>

      {/* Reach & Impressions */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4" /> Reach & Visibility
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Page Views" value={insights.pageViews} icon={<Eye className="w-4 h-4" />} />
          <MetricCard label="Reach" value={insights.reach} icon={<TrendingUp className="w-4 h-4" />} />
          <MetricCard label="Impressions" value={insights.impressions} icon={<BarChart3 className="w-4 h-4" />} />
          <MetricCard label="Post Reach" value={insights.postReach} icon={<TrendingUp className="w-4 h-4" />} />
        </div>
      </div>

      {/* Engagement */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4" /> Engagement
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Engagements" value={insights.engagements} icon={<Heart className="w-4 h-4" />} />
          <MetricCard label="Engaged Users" value={insights.engagedUsers} icon={<Users className="w-4 h-4" />} />
          <MetricCard label="Reactions" value={insights.reactions} icon={<ThumbsUp className="w-4 h-4" />} />
          <MetricCard label="Clicks" value={insights.clicks} icon={<MousePointer className="w-4 h-4" />} />
        </div>
      </div>

      {/* Video & Other */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Play className="w-4 h-4" /> Video & Other
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Video Views" value={insights.videoViews} icon={<Play className="w-4 h-4" />} />
          <MetricCard label="Post Impressions" value={insights.postImpressions} icon={<BarChart3 className="w-4 h-4" />} />
          <MetricCard label="Unlikes" value={insights.unlikes} icon={<ThumbsUp className="w-4 h-4" />} color="red" />
          <MetricCard label="Negative Actions" value={insights.negativeActions} icon={<ThumbsUp className="w-4 h-4" />} color="red" />
        </div>
      </div>

      {insights.period && (
        <p className="text-xs text-slate-400 text-right">Period: {insights.period}</p>
      )}
    </div>
  )
}

function InstagramInsightsGrid({ insights }: { insights: InstagramInsights }) {
  return (
    <div className="space-y-6">
      {/* Audience */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Audience
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Followers" value={insights.followers} icon={<Users className="w-4 h-4" />} />
          <MetricCard label="Following" value={insights.following} icon={<Users className="w-4 h-4" />} />
          <MetricCard label="Posts" value={insights.mediaCount} icon={<BarChart3 className="w-4 h-4" />} />
          <MetricCard label="Profile Views" value={insights.profileViews} icon={<Eye className="w-4 h-4" />} />
        </div>
      </div>

      {/* Reach & Impressions */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4" /> Reach & Visibility
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Reach" value={insights.reach} icon={<TrendingUp className="w-4 h-4" />} />
          <MetricCard label="Impressions" value={insights.impressions} icon={<BarChart3 className="w-4 h-4" />} />
          <MetricCard label="Accounts Engaged" value={insights.accountsEngaged} icon={<Users className="w-4 h-4" />} />
          <MetricCard label="Total Interactions" value={insights.totalInteractions} icon={<Heart className="w-4 h-4" />} />
        </div>
      </div>

      {/* Engagement */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4" /> Engagement
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Likes" value={insights.likes} icon={<Heart className="w-4 h-4" />} />
          <MetricCard label="Comments" value={insights.comments} icon={<MessageCircle className="w-4 h-4" />} />
          <MetricCard label="Shares" value={insights.shares} icon={<Share2 className="w-4 h-4" />} />
          <MetricCard label="Saves" value={insights.saves} icon={<Bookmark className="w-4 h-4" />} />
        </div>
      </div>

      {/* Actions */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <MousePointer className="w-4 h-4" /> Profile Actions
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Website Clicks" value={insights.websiteClicks} icon={<Globe className="w-4 h-4" />} />
          <MetricCard label="Email Contacts" value={insights.emailContacts} icon={<Mail className="w-4 h-4" />} />
          <MetricCard label="Phone Clicks" value={insights.phoneClicks} icon={<Phone className="w-4 h-4" />} />
          <MetricCard label="Directions" value={insights.getDirectionsClicks} icon={<MapPin className="w-4 h-4" />} />
        </div>
      </div>

      {insights.period && (
        <p className="text-xs text-slate-400 text-right">Period: {insights.period}</p>
      )}
    </div>
  )
}

function MetricCard({ 
  label, 
  value, 
  icon, 
  color = 'default' 
}: { 
  label: string
  value: number
  icon: React.ReactNode
  color?: 'default' | 'green' | 'red'
}) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const colorClasses = {
    default: 'text-slate-500',
    green: 'text-green-600',
    red: 'text-red-500',
  }

  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className={`flex items-center gap-1.5 mb-1 ${colorClasses[color]}`}>
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color === 'red' ? 'text-red-600' : color === 'green' ? 'text-green-600' : 'text-slate-900'}`}>
        {formatNumber(value)}
      </div>
    </div>
  )
}
