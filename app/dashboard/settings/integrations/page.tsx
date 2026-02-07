'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, Users, CreditCard, Zap, Link2, 
  Facebook, Instagram, Linkedin, Youtube, Music2,
  Check, ExternalLink, RefreshCw, Unplug
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ConnectedAccount {
  id: string
  platform: string
  platform_account_id: string
  platform_account_name: string | null
  platform_account_type: string | null
  is_active: boolean
  last_synced_at: string | null
  client: {
    id: string
    name: string
  }
}

interface Platform {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
  connected: boolean
  accounts: ConnectedAccount[]
  configurable: boolean
}

export default function IntegrationsSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

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

    // Get all connected accounts for this agency
    const { data: accountsData } = await supabase
      .from('connected_accounts')
      .select('*, clients!inner(id, name, agency_id)')
      .eq('clients.agency_id', membership.agency_id)
      .order('platform')

    // Transform the data
    const transformed = accountsData?.map(acc => ({
      ...acc,
      client: {
        id: acc.clients.id,
        name: acc.clients.name,
      }
    })) || []

    setAccounts(transformed)
    setLoading(false)
  }

  const handleDisconnect = async (accountId: string) => {
    setDisconnecting(accountId)
    
    const supabase = createClient()
    const { error } = await supabase
      .from('connected_accounts')
      .delete()
      .eq('id', accountId)

    if (!error) {
      setAccounts(accounts.filter(a => a.id !== accountId))
    }
    
    setDisconnecting(null)
  }

  const platforms: Platform[] = [
    {
      id: 'meta',
      name: 'Meta (Facebook & Instagram)',
      icon: <Facebook className="w-6 h-6" />,
      description: 'Connect Facebook Pages and Instagram Business accounts',
      color: 'bg-blue-500',
      connected: accounts.some(a => ['facebook_page', 'instagram_business', 'meta'].includes(a.platform || a.platform_account_type || '')),
      accounts: accounts.filter(a => ['facebook_page', 'instagram_business', 'meta'].includes(a.platform || a.platform_account_type || '')),
      configurable: true,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="w-6 h-6" />,
      description: 'Connect LinkedIn Company Pages',
      color: 'bg-sky-600',
      connected: accounts.some(a => a.platform === 'linkedin'),
      accounts: accounts.filter(a => a.platform === 'linkedin'),
      configurable: true,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: <Youtube className="w-6 h-6" />,
      description: 'Connect YouTube channels for analytics',
      color: 'bg-red-600',
      connected: accounts.some(a => a.platform === 'youtube'),
      accounts: accounts.filter(a => a.platform === 'youtube'),
      configurable: true,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <Music2 className="w-6 h-6" />,
      description: 'Connect TikTok Business accounts',
      color: 'bg-black',
      connected: accounts.some(a => a.platform === 'tiktok'),
      accounts: accounts.filter(a => a.platform === 'tiktok'),
      configurable: false,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        <Link 
          href="/dashboard/settings" 
          className="px-4 py-2 text-muted-foreground hover:text-foreground whitespace-nowrap"
        >
          <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Agency</span>
        </Link>
        <Link 
          href="/dashboard/settings/team" 
          className="px-4 py-2 text-muted-foreground hover:text-foreground whitespace-nowrap"
        >
          <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Team</span>
        </Link>
        <Link 
          href="/dashboard/settings/billing" 
          className="px-4 py-2 text-muted-foreground hover:text-foreground whitespace-nowrap"
        >
          <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Billing</span>
        </Link>
        <Link 
          href="/dashboard/settings/credits" 
          className="px-4 py-2 text-muted-foreground hover:text-foreground whitespace-nowrap"
        >
          <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Credits</span>
        </Link>
        <Link 
          href="/dashboard/settings/integrations" 
          className="px-4 py-2 border-b-2 border-primary text-primary font-medium -mb-px whitespace-nowrap"
        >
          <span className="flex items-center gap-2"><Link2 className="w-4 h-4" /> Integrations</span>
        </Link>
      </div>

      {/* Platform Cards */}
      <div className="space-y-4">
        {platforms.map((platform) => (
          <Card key={platform.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${platform.color} text-white rounded-xl flex items-center justify-center`}>
                    {platform.icon}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {platform.name}
                      {platform.connected && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <Check className="w-3 h-3 mr-1" /> Connected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{platform.description}</CardDescription>
                  </div>
                </div>
                {!platform.connected && platform.configurable && (
                  <Button asChild>
                    <Link href="/dashboard/clients">
                      Connect from Client Page
                    </Link>
                  </Button>
                )}
                {!platform.configurable && (
                  <Badge variant="outline">Coming Soon</Badge>
                )}
              </div>
            </CardHeader>

            {platform.accounts.length > 0 && (
              <CardContent className="pt-0">
                <div className="divide-y rounded-lg border">
                  {platform.accounts.map((account) => (
                    <div key={account.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          {account.platform_account_type === 'instagram_business' ? (
                            <Instagram className="w-4 h-4" />
                          ) : (
                            platform.icon
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{account.platform_account_name || 'Unnamed Account'}</p>
                          <p className="text-xs text-muted-foreground">
                            Client: {account.client.name}
                            {account.last_synced_at && (
                              <> • Last synced: {new Date(account.last_synced_at).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Unplug className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disconnect Account?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will disconnect <strong>{account.platform_account_name}</strong> from {account.client.name}. 
                                Historical data will be preserved, but new data won't be synced.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDisconnect(account.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {disconnecting === account.id ? 'Disconnecting...' : 'Disconnect'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Having trouble connecting your accounts? Check our documentation or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href="https://docs.socisync.com/integrations" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Documentation
              </a>
            </Button>
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
