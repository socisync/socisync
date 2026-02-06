// Meta Graph API utilities

const GRAPH_API_VERSION = 'v18.0'
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

export interface PageInsights {
  followers: number
  pageViews: number
  postReach: number
  postEngagement: number
  period: string
}

export interface InstagramInsights {
  followers: number
  profileViews: number
  reach: number
  impressions: number
  period: string
}

export interface PostData {
  id: string
  message?: string
  createdTime: string
  likes: number
  comments: number
  shares: number
  reach?: number
}

// Fetch Facebook Page insights
export async function getPageInsights(
  pageId: string,
  accessToken: string,
  since?: Date,
  until?: Date
): Promise<PageInsights | null> {
  try {
    // Get page followers
    const pageRes = await fetch(
      `${GRAPH_API_BASE}/${pageId}?fields=followers_count,fan_count&access_token=${accessToken}`
    )
    const pageData = await pageRes.json()
    
    if (pageData.error) {
      console.error('Page fetch error:', pageData.error)
      return null
    }

    // Get page insights (lifetime metrics)
    const metricsToFetch = [
      'page_views_total',
      'page_post_engagements',
      'page_impressions',
      'page_fans'
    ].join(',')

    const period = 'day'
    const sinceTs = since ? Math.floor(since.getTime() / 1000) : Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
    const untilTs = until ? Math.floor(until.getTime() / 1000) : Math.floor(Date.now() / 1000)

    const insightsRes = await fetch(
      `${GRAPH_API_BASE}/${pageId}/insights?metric=${metricsToFetch}&period=${period}&since=${sinceTs}&until=${untilTs}&access_token=${accessToken}`
    )
    const insightsData = await insightsRes.json()

    let pageViews = 0
    let postEngagement = 0
    let postReach = 0

    if (insightsData.data) {
      for (const metric of insightsData.data) {
        const total = metric.values?.reduce((sum: number, v: any) => sum + (v.value || 0), 0) || 0
        switch (metric.name) {
          case 'page_views_total':
            pageViews = total
            break
          case 'page_post_engagements':
            postEngagement = total
            break
          case 'page_impressions':
            postReach = total
            break
        }
      }
    }

    return {
      followers: pageData.followers_count || pageData.fan_count || 0,
      pageViews,
      postReach,
      postEngagement,
      period: `${new Date(sinceTs * 1000).toISOString().split('T')[0]} to ${new Date(untilTs * 1000).toISOString().split('T')[0]}`
    }
  } catch (err) {
    console.error('Error fetching page insights:', err)
    return null
  }
}

// Fetch Instagram Business insights
export async function getInstagramInsights(
  igAccountId: string,
  accessToken: string,
  since?: Date,
  until?: Date
): Promise<InstagramInsights | null> {
  try {
    // Get basic account info
    const accountRes = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}?fields=followers_count,media_count,username&access_token=${accessToken}`
    )
    const accountData = await accountRes.json()

    if (accountData.error) {
      console.error('IG account fetch error:', accountData.error)
      return null
    }

    // Get insights (last 30 days for simplicity)
    const metricsToFetch = ['impressions', 'reach', 'profile_views'].join(',')
    
    const insightsRes = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}/insights?metric=${metricsToFetch}&period=day&access_token=${accessToken}`
    )
    const insightsData = await insightsRes.json()

    let profileViews = 0
    let reach = 0
    let impressions = 0

    if (insightsData.data) {
      for (const metric of insightsData.data) {
        const total = metric.values?.reduce((sum: number, v: any) => sum + (v.value || 0), 0) || 0
        switch (metric.name) {
          case 'profile_views':
            profileViews = total
            break
          case 'reach':
            reach = total
            break
          case 'impressions':
            impressions = total
            break
        }
      }
    }

    return {
      followers: accountData.followers_count || 0,
      profileViews,
      reach,
      impressions,
      period: 'Last 30 days'
    }
  } catch (err) {
    console.error('Error fetching Instagram insights:', err)
    return null
  }
}

// Fetch recent posts with engagement
export async function getRecentPosts(
  pageId: string,
  accessToken: string,
  limit = 10
): Promise<PostData[]> {
  try {
    const res = await fetch(
      `${GRAPH_API_BASE}/${pageId}/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares&limit=${limit}&access_token=${accessToken}`
    )
    const data = await res.json()

    if (data.error || !data.data) {
      console.error('Posts fetch error:', data.error)
      return []
    }

    return data.data.map((post: any) => ({
      id: post.id,
      message: post.message,
      createdTime: post.created_time,
      likes: post.likes?.summary?.total_count || 0,
      comments: post.comments?.summary?.total_count || 0,
      shares: post.shares?.count || 0,
    }))
  } catch (err) {
    console.error('Error fetching posts:', err)
    return []
  }
}

// Refresh long-lived token (should be done before expiry)
export async function refreshPageToken(
  accessToken: string
): Promise<{ token: string; expiresIn: number } | null> {
  try {
    const res = await fetch(
      `${GRAPH_API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${accessToken}`
    )
    const data = await res.json()

    if (data.error) {
      console.error('Token refresh error:', data.error)
      return null
    }

    return {
      token: data.access_token,
      expiresIn: data.expires_in
    }
  } catch (err) {
    console.error('Error refreshing token:', err)
    return null
  }
}
