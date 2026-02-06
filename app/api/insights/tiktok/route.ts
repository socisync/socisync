import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdsInsights } from '@/lib/tiktok-api'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const accountId = searchParams.get('account_id')

  if (!accountId) {
    return NextResponse.json({ error: 'account_id required' }, { status: 400 })
  }

  try {
    const { data: account, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (error || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (account.platform !== 'tiktok' || !account.access_token) {
      return NextResponse.json({ error: 'Invalid TikTok account' }, { status: 400 })
    }

    const insights = await getAdsInsights(
      account.platform_account_id,
      account.access_token
    )

    if (!insights) {
      return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
    }

    // Update last_synced_at
    await supabase
      .from('connected_accounts')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', accountId)

    return NextResponse.json({ insights })
  } catch (err: any) {
    console.error('TikTok insights error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
