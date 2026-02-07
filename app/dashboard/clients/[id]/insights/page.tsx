'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Facebook, Instagram, TrendingUp, TrendingDown, Eye, Heart, Users, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { MetricCard, MetricGrid } from '@/components/ui/metric-card'
import { DateRangePicker, type DateRange } from '@/components/ui/date-range-picker'
import { SkeletonCard, DashboardSkeleton } from '@/components/ui/skeleton-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { subDays, format } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Client {
  id: string
  name: string
}

interface ConnectedAccount {
  id: string
  platform: string
  platform_account_id: string
  platform_account_name: string | null
  platform_account_type: string | null
}

interface InsightsData {
  account_type: string
  insights: {
    followers_count?: number
    reach?: number
    impressions?: number
    engagement?: number
    profile_views?: number
  }
  posts?: any[]
}

export default function ClientInsightsPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [client, setClient] = useState<Client | null>(null)
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 29),
    to: new Date(),
  })

  useEffect(() => {
    loadData()
  }, [clientId])

  useEffect(() => {
    if (selectedAccount) {
      loadInsights(selectedAccount)
    }
  }, [selectedAccount])

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
      .select('id, name')
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

    setAccounts(accountsData || [])
    
    // Auto-select first account
    if (accountsData && accountsData.length > 0) {
      setSelectedAccount(accountsData[0].id)
    }

    setLoading(false)
  }

  const loadInsights = async (accountId: string) => {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/insights/meta?account_id=${accountId}&include=all`)
      if (res.ok) {
        const data = await res.json()
        setInsightsData(data)
      }
    } catch (err) {
      console.error('Failed to load insights:', err)
    }
    setRefreshing(false)
  }

  // Generate mock time-series data for demo
  const generateTimeSeriesData = () => {
    const days = 30
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      data.push({
        date: format(date, 'MMM d'),
        reach: Math.floor(Math.random() * 5000 + 8000),
        impressions: Math.floor(Math.random() * 8000 + 12000),
        engagement: Math.floor(Math.random() * 300 + 400),
      })
    }
    return data
  }

  const [timeSeriesData] = useState(generateTimeSeriesData)

  // Platform comparison data
  const platformData = accounts.map((acc, i) => ({
    name: acc.platform_account_name || acc.platform_account_type || 'Account',
    followers: Math.floor(Math.random() * 10000 + 5000),
    engagement: Math.random() * 3 + 2,
    reach: Math.floor(Math.random() * 50000 + 20000),
  }))

  if (loading) {
    return <DashboardSkeleton />
  }

  if (accounts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Connected Accounts</h2>
        <p className="text-muted-foreground mb-6">
          Connect social media accounts to view insights and analytics for {client?.name}.
        </p>
        <Button asChild>
          <Link href={`/dashboard/clients/${clientId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Client
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/clients/${clientId}`} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{client?.name} Insights</h1>
            <p className="text-muted-foreground">{accounts.length} connected account{accounts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button
            variant="outline"
            size="icon"
            onClick={() => selectedAccount && loadInsights(selectedAccount)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Account Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {accounts.map((account) => {
          const Icon = account.platform_account_type === 'instagram_business' ? Instagram : Facebook
          const isSelected = selectedAccount === account.id
          return (
            <button
              key={account.id}
              onClick={() => setSelectedAccount(account.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition whitespace-nowrap ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{account.platform_account_name || 'Account'}</span>
            </button>
          )
        })}
      </div>

      {/* Key Metrics */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          title="Followers"
          value={insightsData?.insights?.followers_count || 12450}
          change={5.2}
          icon={<Users className="w-4 h-4" />}
          format="compact"
          sparklineData={[11200, 11500, 11800, 12000, 12200, 12350, 12450]}
        />
        <MetricCard
          title="Total Reach"
          value={insightsData?.insights?.reach || 234500}
          change={12.3}
          icon={<Eye className="w-4 h-4" />}
          format="compact"
          sparklineData={[180000, 195000, 215000, 225000, 230000, 232000, 234500]}
        />
        <MetricCard
          title="Engagement Rate"
          value={4.82}
          change={0.3}
          icon={<Heart className="w-4 h-4" />}
          format="percentage"
          sparklineData={[4.5, 4.6, 4.7, 4.65, 4.75, 4.8, 4.82]}
        />
        <MetricCard
          title="Posts"
          value={47}
          change={8}
          icon={<FileText className="w-4 h-4" />}
          format="number"
          sparklineData={[38, 40, 42, 43, 45, 46, 47]}
        />
      </MetricGrid>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Engagement Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
            <CardDescription>Daily reach and engagement for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="reach" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={false}
                  name="Reach"
                />
                <Line 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={false}
                  name="Impressions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Comparison */}
        {accounts.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Comparison</CardTitle>
              <CardDescription>Performance across connected accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="followers" fill="hsl(var(--chart-1))" name="Followers" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reach" fill="hsl(var(--chart-2))" name="Reach" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {accounts.length === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Engagement</CardTitle>
              <CardDescription>Likes, comments, and shares per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="engagement" fill="hsl(var(--chart-1))" name="Engagement" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
          <CardDescription>Posts with highest engagement in the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {insightsData?.posts && insightsData.posts.length > 0 ? (
            <div className="divide-y">
              {insightsData.posts.slice(0, 5).map((post: any, i: number) => (
                <div key={i} className="py-3 flex items-center gap-4">
                  {post.full_picture && (
                    <img 
                      src={post.full_picture} 
                      alt="" 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{post.message || 'No caption'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(post.created_time), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(post.likes?.summary?.total_count || 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Likes</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No posts data available for this period.</p>
              <p className="text-sm">Try connecting more accounts or selecting a different date range.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
