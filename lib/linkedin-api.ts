// LinkedIn Marketing API utilities

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2'
const LINKEDIN_API_REST = 'https://api.linkedin.com/rest'

export interface LinkedInOrganization {
  id: string
  name: string
  vanityName: string
  logoUrl?: string
}

export interface LinkedInInsights {
  followers: number
  followersGained: number
  pageViews: number
  uniqueVisitors: number
  period: string
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    })

    const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const data = await res.json()

    if (data.error) {
      console.error('LinkedIn token error:', data)
      return null
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }
  } catch (err) {
    console.error('LinkedIn token exchange error:', err)
    return null
  }
}

// Get organizations the user administers
export async function getAdministeredOrganizations(
  accessToken: string
): Promise<LinkedInOrganization[]> {
  try {
    // First get organization access control
    const aclRes = await fetch(
      `${LINKEDIN_API_BASE}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organization~(id,localizedName,vanityName,logoV2(original~:playableStreams))))`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    )

    const aclData = await aclRes.json()

    if (!aclData.elements) {
      return []
    }

    return aclData.elements.map((el: any) => ({
      id: el['organization~']?.id || el.organization?.split(':').pop(),
      name: el['organization~']?.localizedName || 'Unknown',
      vanityName: el['organization~']?.vanityName || '',
      logoUrl: el['organization~']?.logoV2?.['original~']?.elements?.[0]?.identifiers?.[0]?.identifier,
    }))
  } catch (err) {
    console.error('LinkedIn orgs error:', err)
    return []
  }
}

// Get follower count for an organization
export async function getFollowerCount(
  organizationId: string,
  accessToken: string
): Promise<number> {
  try {
    const res = await fetch(
      `${LINKEDIN_API_BASE}/networkSizes/urn:li:organization:${organizationId}?edgeType=CompanyFollowedByMember`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    )

    const data = await res.json()
    return data.firstDegreeSize || 0
  } catch (err) {
    console.error('LinkedIn follower count error:', err)
    return 0
  }
}

// Get organization page statistics
export async function getOrganizationInsights(
  organizationId: string,
  accessToken: string,
  since?: Date,
  until?: Date
): Promise<LinkedInInsights | null> {
  try {
    const startDate = since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = until || new Date()

    // Get follower statistics
    const followerRes = await fetch(
      `${LINKEDIN_API_BASE}/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${organizationId}&timeIntervals.timeGranularityType=DAY&timeIntervals.timeRange.start=${startDate.getTime()}&timeIntervals.timeRange.end=${endDate.getTime()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202401',
        },
      }
    )

    const followerData = await followerRes.json()

    // Calculate follower gains
    let followersGained = 0
    if (followerData.elements) {
      for (const el of followerData.elements) {
        if (el.followerGains) {
          followersGained += (el.followerGains.organicFollowerGain || 0) + (el.followerGains.paidFollowerGain || 0)
        }
      }
    }

    // Get page statistics
    const pageRes = await fetch(
      `${LINKEDIN_API_BASE}/organizationPageStatistics?q=organization&organization=urn:li:organization:${organizationId}&timeIntervals.timeGranularityType=DAY&timeIntervals.timeRange.start=${startDate.getTime()}&timeIntervals.timeRange.end=${endDate.getTime()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202401',
        },
      }
    )

    const pageData = await pageRes.json()

    let pageViews = 0
    let uniqueVisitors = 0
    if (pageData.elements) {
      for (const el of pageData.elements) {
        if (el.totalPageStatistics?.views) {
          pageViews += el.totalPageStatistics.views.allPageViews?.pageViews || 0
          uniqueVisitors += el.totalPageStatistics.views.allPageViews?.uniquePageViews || 0
        }
      }
    }

    // Get current follower count
    const followers = await getFollowerCount(organizationId, accessToken)

    return {
      followers,
      followersGained,
      pageViews,
      uniqueVisitors,
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    }
  } catch (err) {
    console.error('LinkedIn insights error:', err)
    return null
  }
}

// Build OAuth URL
export function getLinkedInAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const scopes = ['r_organization_admin', 'rw_organization_admin', 'r_organization_social'].join(' ')
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: scopes,
  })

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
}
