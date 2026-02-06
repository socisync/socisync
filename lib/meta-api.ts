// Meta Graph API utilities

const GRAPH_API_VERSION = 'v18.0'
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

// ============ FACEBOOK PAGE INSIGHTS ============

export interface PageInsights {
  // Core metrics
  followers: number
  pageLikes: number
  pageViews: number
  
  // Reach & Impressions
  reach: number
  impressions: number
  postReach: number
  postImpressions: number
  
  // Engagement
  engagements: number
  engagedUsers: number
  reactions: number
  clicks: number
  
  // Video
  videoViews: number
  
  // Growth
  newLikes: number
  unlikes: number
  newFollowers: number
  
  // Negative
  negativeActions: number
  
  period: string
}

export interface PageDemographics {
  fansByAge: Record<string, number>
  fansByGender: Record<string, number>
  fansByCountry: Record<string, number>
  fansByCity: Record<string, number>
}

// ============ INSTAGRAM INSIGHTS ============

export interface InstagramInsights {
  // Core metrics
  followers: number
  following: number
  mediaCount: number
  
  // Reach & Impressions
  reach: number
  impressions: number
  profileViews: number
  
  // Engagement
  accountsEngaged: number
  totalInteractions: number
  likes: number
  comments: number
  shares: number
  saves: number
  replies: number
  
  // Actions
  websiteClicks: number
  emailContacts: number
  phoneClicks: number
  getDirectionsClicks: number
  
  // Growth
  followerCount: number // for tracking changes
  
  period: string
}

export interface InstagramDemographics {
  followersByAge: Record<string, number>
  followersByGender: Record<string, number>
  followersByCountry: Record<string, number>
  followersByCity: Record<string, number>
  onlineFollowers: Record<string, number> // hour -> count
}

export interface PostData {
  id: string
  message?: string
  createdTime: string
  likes: number
  comments: number
  shares: number
  reach?: number
  impressions?: number
  clicks?: number
  videoViews?: number
  saves?: number
  type?: string
}

// ============ FACEBOOK PAGE FUNCTIONS ============

export async function getPageInsights(
  pageId: string,
  accessToken: string,
  since?: Date,
  until?: Date
): Promise<PageInsights | null> {
  try {
    // Get page basic info
    const pageRes = await fetch(
      `${GRAPH_API_BASE}/${pageId}?fields=followers_count,fan_count&access_token=${accessToken}`
    )
    const pageData = await pageRes.json()
    
    if (pageData.error) {
      console.error('Page fetch error:', pageData.error)
      return null
    }

    // Build date range
    const sinceTs = since ? Math.floor(since.getTime() / 1000) : Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
    const untilTs = until ? Math.floor(until.getTime() / 1000) : Math.floor(Date.now() / 1000)

    // Fetch all available metrics
    const metricsToFetch = [
      // Reach & Impressions
      'page_impressions',
      'page_impressions_unique',
      'page_posts_impressions',
      'page_posts_impressions_unique',
      // Engagement
      'page_post_engagements',
      'page_engaged_users',
      'page_consumptions',
      'page_actions_post_reactions_total',
      // Page views
      'page_views_total',
      // Video
      'page_video_views',
      // Fans/Followers
      'page_fan_adds',
      'page_fan_removes',
      'page_fans',
      'page_follows',
      // Negative
      'page_negative_feedback',
    ].join(',')

    const insightsRes = await fetch(
      `${GRAPH_API_BASE}/${pageId}/insights?metric=${metricsToFetch}&period=day&since=${sinceTs}&until=${untilTs}&access_token=${accessToken}`
    )
    const insightsData = await insightsRes.json()

    // Initialize all metrics
    const metrics: Record<string, number> = {
      page_impressions: 0,
      page_impressions_unique: 0,
      page_posts_impressions: 0,
      page_posts_impressions_unique: 0,
      page_post_engagements: 0,
      page_engaged_users: 0,
      page_consumptions: 0,
      page_actions_post_reactions_total: 0,
      page_views_total: 0,
      page_video_views: 0,
      page_fan_adds: 0,
      page_fan_removes: 0,
      page_follows: 0,
      page_negative_feedback: 0,
    }

    if (insightsData.data) {
      for (const metric of insightsData.data) {
        const total = metric.values?.reduce((sum: number, v: any) => sum + (v.value || 0), 0) || 0
        if (metrics.hasOwnProperty(metric.name)) {
          metrics[metric.name] = total
        }
      }
    }

    return {
      followers: pageData.followers_count || pageData.fan_count || 0,
      pageLikes: pageData.fan_count || 0,
      pageViews: metrics.page_views_total,
      reach: metrics.page_impressions_unique,
      impressions: metrics.page_impressions,
      postReach: metrics.page_posts_impressions_unique,
      postImpressions: metrics.page_posts_impressions,
      engagements: metrics.page_post_engagements,
      engagedUsers: metrics.page_engaged_users,
      reactions: metrics.page_actions_post_reactions_total,
      clicks: metrics.page_consumptions,
      videoViews: metrics.page_video_views,
      newLikes: metrics.page_fan_adds,
      unlikes: metrics.page_fan_removes,
      newFollowers: metrics.page_follows,
      negativeActions: metrics.page_negative_feedback,
      period: `${new Date(sinceTs * 1000).toISOString().split('T')[0]} to ${new Date(untilTs * 1000).toISOString().split('T')[0]}`
    }
  } catch (err) {
    console.error('Error fetching page insights:', err)
    return null
  }
}

export async function getPageDemographics(
  pageId: string,
  accessToken: string
): Promise<PageDemographics | null> {
  try {
    const metricsToFetch = [
      'page_fans_gender_age',
      'page_fans_country',
      'page_fans_city',
    ].join(',')

    const res = await fetch(
      `${GRAPH_API_BASE}/${pageId}/insights?metric=${metricsToFetch}&period=lifetime&access_token=${accessToken}`
    )
    const data = await res.json()

    const demographics: PageDemographics = {
      fansByAge: {},
      fansByGender: {},
      fansByCountry: {},
      fansByCity: {},
    }

    if (data.data) {
      for (const metric of data.data) {
        const value = metric.values?.[0]?.value || {}
        switch (metric.name) {
          case 'page_fans_gender_age':
            // Parse "M.25-34" format
            for (const [key, count] of Object.entries(value)) {
              const [gender, age] = key.split('.')
              demographics.fansByAge[age] = (demographics.fansByAge[age] || 0) + (count as number)
              demographics.fansByGender[gender] = (demographics.fansByGender[gender] || 0) + (count as number)
            }
            break
          case 'page_fans_country':
            demographics.fansByCountry = value
            break
          case 'page_fans_city':
            demographics.fansByCity = value
            break
        }
      }
    }

    return demographics
  } catch (err) {
    console.error('Error fetching page demographics:', err)
    return null
  }
}

// ============ INSTAGRAM FUNCTIONS ============

export async function getInstagramInsights(
  igAccountId: string,
  accessToken: string,
  since?: Date,
  until?: Date
): Promise<InstagramInsights | null> {
  try {
    // Get basic account info
    const accountRes = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}?fields=followers_count,follows_count,media_count,username&access_token=${accessToken}`
    )
    const accountData = await accountRes.json()

    if (accountData.error) {
      console.error('IG account fetch error:', accountData.error)
      return null
    }

    // Get daily insights
    const dailyMetrics = [
      'impressions',
      'reach',
      'profile_views',
      'accounts_engaged',
      'total_interactions',
      'likes',
      'comments',
      'shares',
      'saves',
      'replies',
      'website_clicks',
      'email_contacts',
      'phone_call_clicks',
      'get_directions_clicks',
      'follower_count',
    ].join(',')
    
    const insightsRes = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}/insights?metric=${dailyMetrics}&period=day&access_token=${accessToken}`
    )
    const insightsData = await insightsRes.json()

    // Initialize metrics
    const metrics: Record<string, number> = {
      impressions: 0,
      reach: 0,
      profile_views: 0,
      accounts_engaged: 0,
      total_interactions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      replies: 0,
      website_clicks: 0,
      email_contacts: 0,
      phone_call_clicks: 0,
      get_directions_clicks: 0,
      follower_count: 0,
    }

    if (insightsData.data) {
      for (const metric of insightsData.data) {
        const total = metric.values?.reduce((sum: number, v: any) => sum + (v.value || 0), 0) || 0
        if (metrics.hasOwnProperty(metric.name)) {
          metrics[metric.name] = total
        }
      }
    }

    return {
      followers: accountData.followers_count || 0,
      following: accountData.follows_count || 0,
      mediaCount: accountData.media_count || 0,
      reach: metrics.reach,
      impressions: metrics.impressions,
      profileViews: metrics.profile_views,
      accountsEngaged: metrics.accounts_engaged,
      totalInteractions: metrics.total_interactions,
      likes: metrics.likes,
      comments: metrics.comments,
      shares: metrics.shares,
      saves: metrics.saves,
      replies: metrics.replies,
      websiteClicks: metrics.website_clicks,
      emailContacts: metrics.email_contacts,
      phoneClicks: metrics.phone_call_clicks,
      getDirectionsClicks: metrics.get_directions_clicks,
      followerCount: metrics.follower_count,
      period: 'Last 30 days'
    }
  } catch (err) {
    console.error('Error fetching Instagram insights:', err)
    return null
  }
}

export async function getInstagramDemographics(
  igAccountId: string,
  accessToken: string
): Promise<InstagramDemographics | null> {
  try {
    const metricsToFetch = [
      'follower_demographics',
      'online_followers',
    ].join(',')

    const res = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}/insights?metric=${metricsToFetch}&period=lifetime&access_token=${accessToken}`
    )
    const data = await res.json()

    const demographics: InstagramDemographics = {
      followersByAge: {},
      followersByGender: {},
      followersByCountry: {},
      followersByCity: {},
      onlineFollowers: {},
    }

    if (data.data) {
      for (const metric of data.data) {
        const value = metric.values?.[0]?.value || {}
        switch (metric.name) {
          case 'follower_demographics':
            if (value.age) demographics.followersByAge = value.age
            if (value.gender) demographics.followersByGender = value.gender
            if (value.country) demographics.followersByCountry = value.country
            if (value.city) demographics.followersByCity = value.city
            break
          case 'online_followers':
            demographics.onlineFollowers = value
            break
        }
      }
    }

    return demographics
  } catch (err) {
    console.error('Error fetching Instagram demographics:', err)
    return null
  }
}

// ============ POSTS FUNCTIONS ============

export async function getRecentPosts(
  pageId: string,
  accessToken: string,
  limit = 10
): Promise<PostData[]> {
  try {
    const res = await fetch(
      `${GRAPH_API_BASE}/${pageId}/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares,attachments{type}&limit=${limit}&access_token=${accessToken}`
    )
    const data = await res.json()

    if (data.error || !data.data) {
      console.error('Posts fetch error:', data.error)
      return []
    }

    // Get insights for each post
    const posts: PostData[] = []
    for (const post of data.data) {
      // Fetch post insights
      let reach = 0, impressions = 0, clicks = 0, videoViews = 0
      try {
        const insightsRes = await fetch(
          `${GRAPH_API_BASE}/${post.id}/insights?metric=post_impressions,post_impressions_unique,post_clicks,post_video_views&access_token=${accessToken}`
        )
        const insightsData = await insightsRes.json()
        if (insightsData.data) {
          for (const m of insightsData.data) {
            const val = m.values?.[0]?.value || 0
            switch (m.name) {
              case 'post_impressions': impressions = val; break
              case 'post_impressions_unique': reach = val; break
              case 'post_clicks': clicks = val; break
              case 'post_video_views': videoViews = val; break
            }
          }
        }
      } catch (e) {
        // Insights may not be available for all posts
      }

      posts.push({
        id: post.id,
        message: post.message,
        createdTime: post.created_time,
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        shares: post.shares?.count || 0,
        reach,
        impressions,
        clicks,
        videoViews,
        type: post.attachments?.data?.[0]?.type || 'status',
      })
    }

    return posts
  } catch (err) {
    console.error('Error fetching posts:', err)
    return []
  }
}

export async function getInstagramMedia(
  igAccountId: string,
  accessToken: string,
  limit = 10
): Promise<PostData[]> {
  try {
    const res = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}/media?fields=id,caption,timestamp,media_type,like_count,comments_count,insights.metric(impressions,reach,saved,shares)&limit=${limit}&access_token=${accessToken}`
    )
    const data = await res.json()

    if (data.error || !data.data) {
      console.error('IG media fetch error:', data.error)
      return []
    }

    return data.data.map((media: any) => {
      const insights = media.insights?.data || []
      let reach = 0, impressions = 0, saves = 0, shares = 0
      for (const m of insights) {
        const val = m.values?.[0]?.value || 0
        switch (m.name) {
          case 'reach': reach = val; break
          case 'impressions': impressions = val; break
          case 'saved': saves = val; break
          case 'shares': shares = val; break
        }
      }

      return {
        id: media.id,
        message: media.caption,
        createdTime: media.timestamp,
        likes: media.like_count || 0,
        comments: media.comments_count || 0,
        shares,
        reach,
        impressions,
        saves,
        type: media.media_type,
      }
    })
  } catch (err) {
    console.error('Error fetching IG media:', err)
    return []
  }
}

// ============ TOKEN FUNCTIONS ============

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
