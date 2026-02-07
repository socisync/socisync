'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Image, FileText, Video, Mic, Sparkles, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CreditTransaction {
  id: string
  type: 'usage' | 'purchase' | 'refund' | 'allocation' | 'bonus'
  feature?: 'image' | 'text' | 'video' | 'voice' | 'other'
  amount: number
  balance_after: number
  description: string
  created_at: string
  metadata?: Record<string, any>
}

interface CreditHistoryProps {
  transactions: CreditTransaction[]
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

const featureIcons: Record<string, React.ReactNode> = {
  image: <Image className="w-4 h-4" />,
  text: <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  voice: <Mic className="w-4 h-4" />,
  other: <Sparkles className="w-4 h-4" />,
}

const featureLabels: Record<string, string> = {
  image: 'Image Generation',
  text: 'Content Writing',
  video: 'Video Creation',
  voice: 'Voice Synthesis',
  other: 'AI Feature',
}

export function CreditHistory({
  transactions,
  loading = false,
  onLoadMore,
  hasMore = false,
}: CreditHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'usage' | 'purchase'>('all')

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    if (filter === 'usage') return tx.type === 'usage'
    if (filter === 'purchase') return ['purchase', 'bonus', 'refund'].includes(tx.type)
    return true
  })

  if (transactions.length === 0 && !loading) {
    return (
      <div className="bg-card rounded-xl border p-8 text-center">
        <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium text-lg mb-2">No transactions yet</h3>
        <p className="text-muted-foreground text-sm">
          Your credit usage history will appear here once you start using AI features.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Transaction History</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'secondary' : 'ghost'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'usage' ? 'secondary' : 'ghost'}
            onClick={() => setFilter('usage')}
          >
            Usage
          </Button>
          <Button
            size="sm"
            variant={filter === 'purchase' ? 'secondary' : 'ghost'}
            onClick={() => setFilter('purchase')}
          >
            Credits
          </Button>
        </div>
      </div>

      <div className="divide-y">
        {filteredTransactions.map((tx) => (
          <CreditTransactionRow key={tx.id} transaction={tx} />
        ))}
      </div>

      {loading && (
        <div className="p-4 text-center text-muted-foreground">
          Loading...
        </div>
      )}

      {hasMore && !loading && (
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={onLoadMore}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

function CreditTransactionRow({ transaction: tx }: { transaction: CreditTransaction }) {
  const isCredit = tx.amount > 0
  
  return (
    <div className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        isCredit ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
      )}>
        {tx.feature ? featureIcons[tx.feature] : (
          isCredit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{tx.description}</span>
          <Badge variant="outline" className="text-xs">
            {tx.type}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}
          {tx.feature && ` • ${featureLabels[tx.feature]}`}
        </p>
      </div>

      <div className="text-right">
        <p className={cn(
          "font-medium",
          isCredit ? 'text-green-600' : 'text-foreground'
        )}>
          {isCredit ? '+' : ''}{tx.amount.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          Balance: {tx.balance_after.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

// Stats summary component
interface CreditStatsProps {
  thisMonth: number
  lastMonth: number
  topFeature?: string
  averageDaily?: number
}

export function CreditStats({ thisMonth, lastMonth, topFeature, averageDaily }: CreditStatsProps) {
  const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-sm text-muted-foreground mb-1">This Month</p>
        <p className="text-2xl font-bold">{thisMonth.toLocaleString()}</p>
        {change !== 0 && (
          <p className={cn(
            "text-sm",
            change > 0 ? 'text-amber-600' : 'text-green-600'
          )}>
            {change > 0 ? '+' : ''}{change.toFixed(0)}% vs last month
          </p>
        )}
      </div>
      
      <div className="bg-card rounded-xl border p-4">
        <p className="text-sm text-muted-foreground mb-1">Last Month</p>
        <p className="text-2xl font-bold">{lastMonth.toLocaleString()}</p>
      </div>
      
      <div className="bg-card rounded-xl border p-4">
        <p className="text-sm text-muted-foreground mb-1">Daily Average</p>
        <p className="text-2xl font-bold">{averageDaily?.toLocaleString() || '—'}</p>
      </div>
      
      <div className="bg-card rounded-xl border p-4">
        <p className="text-sm text-muted-foreground mb-1">Top Feature</p>
        <p className="text-2xl font-bold capitalize">{topFeature || '—'}</p>
      </div>
    </div>
  )
}
