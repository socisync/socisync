'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, BarChart3, FileText, Plus, TrendingUp, Eye, Heart, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { MetricCard, MetricGrid } from '@/components/ui/metric-card'
import { DateRangePicker, type DateRange } from '@/components/ui/date-range-picker'
import { DashboardSkeleton } from '@/components/ui/skeleton-card'
import { Button } from '@/components/ui/button'
import { subDays } from 'date-fns'

interface Agency {
  id: string
  name: string
}

interface Client {
  id: string
  name: string
  website: string | null
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [agency, setAgency] = useState<Agency | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [clientsCount, setClientsCount] = useState(0)
  const [accountsCount, setAccountsCount] = useState(0)
  const [reportsCount, setReportsCount] = useState(0)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 29),
    to: new Date(),
  })

  // Mock metrics data (would come from API based on date range)
  const [metrics, setMetrics] = useState({
    reach: { current: 234500, change: 15.3, sparkline: [180000, 195000, 210000, 220000, 215000, 230000, 234500] },
    engagement: { current: 4.82, change: 0.3, sparkline: [4.5, 4.6, 4.7, 4.5, 4.8, 4.9, 4.82] },
    followers: { current: 12400, change: 7.2, sparkline: [11200, 11500, 11800, 12000, 12100, 12300, 12400] },
    posts: { current: 47, change: 12, sparkline: [35, 38, 40, 42, 44, 45, 47] },
  })

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get membership
      const { data: membership } = await supabase
        .from('agency_members')
        .select('agency_id, role, agencies(*)')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!membership) {
        router.push('/onboarding')
        return
      }

      const agencyData = membership.agencies as any
      setAgency(agencyData)

      // Get clients
      const { data: clientsData, count } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('agency_id', agencyData.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setClients(clientsData || [])
      setClientsCount(count || 0)

      // Get accounts count
      const { count: acctCount } = await supabase
        .from('connected_accounts')
        .select('*, clients!inner(agency_id)', { count: 'exact', head: true })
        .eq('clients.agency_id', agencyData.id)

      setAccountsCount(acctCount || 0)

      // Get reports count
      const { count: rptCount } = await supabase
        .from('reports')
        .select('*, clients!inner(agency_id)', { count: 'exact', head: true })
        .eq('clients.agency_id', agencyData.id)

      setReportsCount(rptCount || 0)
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">{agency?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Primary Metrics */}
      <MetricGrid columns={4} className="mb-6">
        <MetricCard
          title="Total Reach"
          value={metrics.reach.current}
          change={metrics.reach.change}
          sparklineData={metrics.reach.sparkline}
          icon={<Eye className="w-4 h-4" />}
          format="compact"
        />
        <MetricCard
          title="Engagement Rate"
          value={metrics.engagement.current}
          change={metrics.engagement.change}
          sparklineData={metrics.engagement.sparkline}
          icon={<Heart className="w-4 h-4" />}
          format="percentage"
        />
        <MetricCard
          title="Total Followers"
          value={metrics.followers.current}
          change={metrics.followers.change}
          sparklineData={metrics.followers.sparkline}
          icon={<Users className="w-4 h-4" />}
          format="compact"
        />
        <MetricCard
          title="Posts Published"
          value={metrics.posts.current}
          change={metrics.posts.change}
          sparklineData={metrics.posts.sparkline}
          icon={<Calendar className="w-4 h-4" />}
          format="number"
        />
      </MetricGrid>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <QuickStatCard 
          icon={<Users className="w-6 h-6" />}
          label="Total Clients"
          value={clientsCount}
          href="/dashboard/clients"
        />
        <QuickStatCard 
          icon={<BarChart3 className="w-6 h-6" />}
          label="Connected Accounts"
          value={accountsCount}
        />
        <QuickStatCard 
          icon={<FileText className="w-6 h-6" />}
          label="Reports Generated"
          value={reportsCount}
          href="/dashboard/reports"
        />
      </div>

      {/* Recent Clients */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Recent Clients</h2>
          <Button asChild size="sm">
            <Link href="/dashboard/clients/new">
              <Plus className="w-4 h-4 mr-1" /> Add Client
            </Link>
          </Button>
        </div>
        
        {clients.length > 0 ? (
          <div className="divide-y">
            {clients.map((client) => (
              <Link 
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-lg font-semibold text-muted-foreground">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{client.name}</div>
                    {client.website && (
                      <div className="text-sm text-muted-foreground">{client.website}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(client.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No clients yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Add your first client to get started</p>
            <Button asChild>
              <Link href="/dashboard/clients/new">
                <Plus className="w-4 h-4 mr-2" /> Add Your First Client
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function QuickStatCard({ 
  icon, 
  label, 
  value, 
  href 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  href?: string
}) {
  const content = (
    <div className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
