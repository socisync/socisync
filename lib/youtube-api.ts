// YouTube Data & Analytics API utilities

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'
const YOUTUBE_ANALYTICS_BASE = 'https://youtubeanalytics.googleapis.com/v2'

export interface YouTubeChannel {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  subscriberCount: number
}

export interface YouTubeInsights {
  subscribers: number
  views: number
  estimatedMinutesWatched: number
  averageViewDuration: number
  likes: number
  comments: number
  period: string
}

// Exchange authorization code for tokens
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    })

    const data = await res.json()

    if (data.error) {
      console.error('YouTube token error:', data)
      return null
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    }
  } catch (err) {
    console.error('YouTube token exchange error:', err)
    return null
  }
}

// Refresh access token
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    })

    const data = await res.json()

    if (data.error) {
      return null
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }
  } catch (err) {
    return null
  }
}

// Get user's YouTube channels
export async function getChannels(accessToken: string): Promise<YouTubeChannel[]> {
  try {
    const res = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&mine=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    const data = await res.json()

    if (!data.items) {
      return []
    }

    return data.items.map((channel: any) => ({
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnailUrl: channel.snippet.thumbnails?.default?.url,
      subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
    }))
  } catch (err) {
    console.error('YouTube channels error:', err)
    return []
  }
}

// Get channel analytics
export async function getChannelAnalytics(
  channelId: string,
  accessToken: string,
  since?: Date,
  until?: Date
): Promise<YouTubeInsights | null> {
  try {
    const startDate = since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = until || new Date()

    // Format dates as YYYY-MM-DD
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    // Get analytics data
    const analyticsRes = await fetch(
      `${YOUTUBE_ANALYTICS_BASE}/reports?ids=channel==${channelId}&startDate=${startStr}&endDate=${endStr}&metrics=views,estimatedMinutesWatched,averageViewDuration,likes,comments,subscribersGained,subscribersLost`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    const analyticsData = await analyticsRes.json()

    // Get current subscriber count from Data API
    const channelRes = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=statistics&id=${channelId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    const channelData = await channelRes.json()
    const subscribers = parseInt(channelData.items?.[0]?.statistics?.subscriberCount || '0')

    // Parse analytics rows
    const row = analyticsData.rows?.[0] || []
    const columnHeaders = analyticsData.columnHeaders || []
    
    const getValue = (metric: string): number => {
      const index = columnHeaders.findIndex((h: any) => h.name === metric)
      return index >= 0 ? (row[index] || 0) : 0
    }

    return {
      subscribers,
      views: getValue('views'),
      estimatedMinutesWatched: getValue('estimatedMinutesWatched'),
      averageViewDuration: getValue('averageViewDuration'),
      likes: getValue('likes'),
      comments: getValue('comments'),
      period: `${startStr} to ${endStr}`,
    }
  } catch (err) {
    console.error('YouTube analytics error:', err)
    return null
  }
}

// Build OAuth URL
export function getYouTubeAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}
