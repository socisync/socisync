'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, Users, CreditCard, Zap, Package, Plus, 
  TrendingUp, History, AlertCircle, Check
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { CreditBalance } from '@/components/credits/credit-balance'
import { CreditHistory, CreditStats } from '@/components/credits/credit-history'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface CreditBalance {
  credits_total: number
  credits_used: number
  credits_available: number
  next_reset_at: string | null
}

const creditPacks = [
  { id: 'pack-50', credits: 50, price: 7, popular: false },
  { id: 'pack-100', credits: 100, price: 12, popular: false },
  { id: 'pack-500', credits: 500, price: 55, popular: true },
  { id: 'pack-1000', credits: 1000, price: 100, popular: false },
]

export default function CreditsSettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showTopUp = searchParams.get('action') === 'topup'
  
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [topUpOpen, setTopUpOpen] = useState(showTopUp)

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

    // Get agency membership
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

    // Try to get credit balance (may not exist yet)
    const { data: balanceData } = await supabase
      .from('credit_balances')
      .select('*')
      .eq('account_id', membership.agency_id)
      .single()

    if (balanceData) {
      setBalance({
        credits_total: balanceData.credits_total,
        credits_used: balanceData.credits_used,
        credits_available: balanceData.credits_total - balanceData.credits_used,
        next_reset_at: balanceData.next_reset_at,
      })
    } else {
      // Default balance for demo
      setBalance({
        credits_total: 500,
        credits_used: 123,
        credits_available: 377,
        next_reset_at: null,
      })
    }

    // Get transactions (may not exist yet)
    const { data: txData } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('account_id', membership.agency_id)
      .order('created_at', { ascending: false })
      .limit(20)

    setTransactions(txData || [])
    setLoading(false)
  }

  const handlePurchase = (packId: string) => {
    // In production, redirect to Stripe Checkout
    alert(`Stripe checkout for ${packId} coming soon!`)
    setTopUpOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const percentage = balance ? (balance.credits_available / balance.credits_total) * 100 : 0
  const isLow = percentage < 20

  return (
    <div className="max-w-5xl">
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
          className="px-4 py-2 border-b-2 border-primary text-primary font-medium -mb-px whitespace-nowrap"
        >
          <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Credits</span>
        </Link>
      </div>

      {/* Low Balance Warning */}
      {isLow && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">Low Credit Balance</h3>
            <p className="text-sm text-amber-700 mt-1">
              You have {balance?.credits_available} credits remaining. Top up to continue using AI features without interruption.
            </p>
          </div>
          <Button size="sm" onClick={() => setTopUpOpen(true)}>
            Top Up Now
          </Button>
        </div>
      )}

      {/* Balance Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Credit Balance
            </CardTitle>
            <CardDescription>Your current AI credit allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold">{balance?.credits_available.toLocaleString()}</span>
              <span className="text-muted-foreground mb-1">/ {balance?.credits_total.toLocaleString()} credits</span>
            </div>
            <Progress value={percentage} className="h-3 mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{balance?.credits_used.toLocaleString()} used this period</span>
              <span>{Math.round(percentage)}% remaining</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Top Up Credits
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Buy Credit Pack</DialogTitle>
                  <DialogDescription>
                    Select a credit pack to add to your balance. Credits never expire.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  {creditPacks.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => handlePurchase(pack.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-colors hover:border-primary ${
                        pack.popular ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      {pack.popular && (
                        <Badge className="absolute -top-2 right-4">Most Popular</Badge>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-lg">{pack.credits.toLocaleString()} Credits</p>
                          <p className="text-sm text-muted-foreground">
                            £{(pack.price / pack.credits * 100).toFixed(1)}p per credit
                          </p>
                        </div>
                        <p className="text-2xl font-bold">£{pack.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Secure payment powered by Stripe. Credits are added instantly.
                </p>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/settings/billing">
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Usage Stats */}
      <CreditStats
        thisMonth={balance?.credits_used || 0}
        lastMonth={87}
        topFeature="text"
        averageDaily={Math.round((balance?.credits_used || 0) / 30)}
      />

      {/* Credit Costs Reference */}
      <Card className="mt-8 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Credit Costs
          </CardTitle>
          <CardDescription>How credits are used for different AI features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Image Generation</p>
                <p className="text-sm text-muted-foreground">1-2 credits</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Post Copy</p>
                <p className="text-sm text-muted-foreground">1 credit</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Long-form Content</p>
                <p className="text-sm text-muted-foreground">3 credits</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Video Subtitles</p>
                <p className="text-sm text-muted-foreground">1 credit/min</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <Check className="w-4 h-4 inline-block mr-1 text-green-500" />
            Caption suggestions and hashtag recommendations are free and unlimited.
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Transaction History
        </h2>
        <CreditHistory transactions={transactions} />
      </div>
    </div>
  )
}
