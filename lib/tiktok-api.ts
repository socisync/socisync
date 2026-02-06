// TikTok Marketing API utilities

const TIKTOK_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3'

export interface TikTokAdvertiser {
  advertiser_id: string
  advertiser_name: string
  currency: string
  timezone: string
}

export interface TikTokAdsInsights {
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  conversions: number
  costPerConversion: number
  period: string
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    const res = await fetch(`${TIKTOK_API_BASE}/oauth2/access_token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: process.env.TIKTOK_APP_ID,
        secret: process.env.TIKTOK_APP_SECRET,
        auth_code: code,
      }),
    })

    const data = await res.json()

    if (data.code !== 0) {
      console.error('TikTok token error:', data)
      return null
    }

    return {
      accessToken: data.data.access_token,
      expiresIn: data.data.expires_in || 86400,
    }
  } catch (err) {
    console.error('TikTok token exchange error:', err)
    return null
  }
}

// Get advertiser accounts the user has access to
export async function getAdvertiserAccounts(
  accessToken: string
): Promise<TikTokAdvertiser[]> {
  try {
    const res = await fetch(`${TIKTOK_API_BASE}/oauth2/advertiser/get/`, {
      method: 'GET',
      headers: {
        'Access-Token': accessToken,
      },
    })

    const data = await res.json()

    if (data.code !== 0 || !data.data?.list) {
      return []
    }

    return data.data.list.map((adv: any) => ({
      advertiser_id: adv.advertiser_id,
      advertiser_name: adv.advertiser_name,
      currency: adv.currency,
      timezone: adv.timezone,
    }))
  } catch (err) {
    console.error('TikTok advertisers error:', err)
    return []
  }
}

// Get ads reporting data
export async function getAdsInsights(
  advertiserId: string,
  accessToken: string,
  since?: Date,
  until?: Date
): Promise<TikTokAdsInsights | null> {
  try {
    const startDate = since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = until || new Date()

    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    const params = new URLSearchParams({
      advertiser_id: advertiserId,
      report_type: 'BASIC',
      dimensions: JSON.stringify(['stat_time_day']),
      data_level: 'AUCTION_ADVERTISER',
      start_date: startStr,
      end_date: endStr,
      metrics: JSON.stringify([
        'spend',
        'impressions',
        'clicks',
        'ctr',
        'cpc',
        'cpm',
        'conversion',
        'cost_per_conversion',
      ]),
    })

    const res = await fetch(`${TIKTOK_API_BASE}/report/integrated/get/?${params.toString()}`, {
      headers: {
        'Access-Token': accessToken,
      },
    })

    const data = await res.json()

    if (data.code !== 0) {
      console.error('TikTok insights error:', data)
      return null
    }

    // Aggregate the metrics from all rows
    let spend = 0
    let impressions = 0
    let clicks = 0
    let conversions = 0
    let costPerConversion = 0
    let rows = 0

    if (data.data?.list) {
      for (const row of data.data.list) {
        const metrics = row.metrics || {}
        spend += parseFloat(metrics.spend || 0)
        impressions += parseInt(metrics.impressions || 0)
        clicks += parseInt(metrics.clicks || 0)
        conversions += parseInt(metrics.conversion || 0)
        costPerConversion += parseFloat(metrics.cost_per_conversion || 0)
        rows++
      }
    }

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
    const cpc = clicks > 0 ? spend / clicks : 0
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0
    const avgCostPerConversion = rows > 0 ? costPerConversion / rows : 0

    return {
      spend,
      impressions,
      clicks,
      ctr,
      cpc,
      cpm,
      conversions,
      costPerConversion: avgCostPerConversion,
      period: `${startStr} to ${endStr}`,
    }
  } catch (err) {
    console.error('TikTok insights error:', err)
    return null
  }
}

// Build OAuth URL
export function getTikTokAuthUrl(appId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    app_id: appId,
    redirect_uri: redirectUri,
    state,
  })

  return `https://business-api.tiktok.com/portal/auth?${params.toString()}`
}
