import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  getPageInsights, 
  getInstagramInsights,
  getPageDemographics,
  getInstagramDemographics,
  getRecentPosts,
  getInstagramMedia
} from '@/lib/meta-api'

// Create admin client for API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const accountId = searchParams.get('account_id')
  const include = searchParams.get('include') || 'insights' // insights,demographics,posts,all

  if (!accountId) {
    return NextResponse.json({ error: 'account_id required' }, { status: 400 })
  }

  try {
    // Get the connected account
    const { data: account, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (error || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (!account.access_token) {
      return NextResponse.json({ error: 'No access token' }, { status: 400 })
    }

    const response: Record<string, any> = {
      account_type: account.platform_account_type,
    }

    const shouldInclude = (key: string) => 
      include === 'all' || include.split(',').includes(key)

    if (account.platform_account_type === 'facebook_page') {
      // Facebook Page
      if (shouldInclude('insights')) {
        response.insights = await getPageInsights(account.platform_account_id, account.access_token)
      }
      if (shouldInclude('demographics')) {
        response.demographics = await getPageDemographics(account.platform_account_id, account.access_token)
      }
      if (shouldInclude('posts')) {
        response.posts = await getRecentPosts(account.platform_account_id, account.access_token, 25)
      }
    } else if (account.platform_account_type === 'instagram_business') {
      // Instagram Business
      if (shouldInclude('insights')) {
        response.insights = await getInstagramInsights(account.platform_account_id, account.access_token)
      }
      if (shouldInclude('demographics')) {
        response.demographics = await getInstagramDemographics(account.platform_account_id, account.access_token)
      }
      if (shouldInclude('posts')) {
        response.posts = await getInstagramMedia(account.platform_account_id, account.access_token, 25)
      }
    }

    if (!response.insights && shouldInclude('insights')) {
      return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
    }

    // Update last_synced_at
    await supabase
      .from('connected_accounts')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', accountId)

    return NextResponse.json(response)
  } catch (err: any) {
    console.error('Insights API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
