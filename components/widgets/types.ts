export type WidgetType = 'metric_card' | 'line_chart' | 'bar_chart' | 'pie_chart'
export type WidgetSize = 'small' | 'medium' | 'large'
export type Platform = 'meta' | 'linkedin' | 'youtube' | 'tiktok' | 'all'

export interface Widget {
  id: string
  dashboard_id: string
  widget_type: WidgetType
  title?: string
  platform: Platform
  account_id?: string
  metric: string
  size: WidgetSize
  position: number
  config: Record<string, any>
}

export interface WidgetData {
  current: number
  previous?: number
  change?: number
  series?: { date: string; value: number }[]
  breakdown?: { label: string; value: number }[]
}

// All available metrics by platform
export const METRICS = {
  meta: {
    facebook: [
      { key: 'followers', label: 'Followers', category: 'Audience' },
      { key: 'pageLikes', label: 'Page Likes', category: 'Audience' },
      { key: 'newLikes', label: 'New Likes', category: 'Growth' },
      { key: 'newFollowers', label: 'New Followers', category: 'Growth' },
      { key: 'pageViews', label: 'Page Views', category: 'Reach' },
      { key: 'reach', label: 'Reach', category: 'Reach' },
      { key: 'impressions', label: 'Impressions', category: 'Reach' },
      { key: 'postReach', label: 'Post Reach', category: 'Reach' },
      { key: 'postImpressions', label: 'Post Impressions', category: 'Reach' },
      { key: 'engagements', label: 'Engagements', category: 'Engagement' },
      { key: 'engagedUsers', label: 'Engaged Users', category: 'Engagement' },
      { key: 'reactions', label: 'Reactions', category: 'Engagement' },
      { key: 'clicks', label: 'Clicks', category: 'Engagement' },
      { key: 'videoViews', label: 'Video Views', category: 'Video' },
    ],
    instagram: [
      { key: 'followers', label: 'Followers', category: 'Audience' },
      { key: 'following', label: 'Following', category: 'Audience' },
      { key: 'mediaCount', label: 'Posts', category: 'Content' },
      { key: 'profileViews', label: 'Profile Views', category: 'Reach' },
      { key: 'reach', label: 'Reach', category: 'Reach' },
      { key: 'impressions', label: 'Impressions', category: 'Reach' },
      { key: 'accountsEngaged', label: 'Accounts Engaged', category: 'Engagement' },
      { key: 'totalInteractions', label: 'Total Interactions', category: 'Engagement' },
      { key: 'likes', label: 'Likes', category: 'Engagement' },
      { key: 'comments', label: 'Comments', category: 'Engagement' },
      { key: 'shares', label: 'Shares', category: 'Engagement' },
      { key: 'saves', label: 'Saves', category: 'Engagement' },
      { key: 'websiteClicks', label: 'Website Clicks', category: 'Actions' },
      { key: 'emailContacts', label: 'Email Contacts', category: 'Actions' },
      { key: 'phoneClicks', label: 'Phone Clicks', category: 'Actions' },
      { key: 'getDirectionsClicks', label: 'Get Directions', category: 'Actions' },
    ],
  },
  linkedin: [
    { key: 'followers', label: 'Followers', category: 'Audience' },
    { key: 'impressions', label: 'Impressions', category: 'Reach' },
    { key: 'clicks', label: 'Clicks', category: 'Engagement' },
    { key: 'engagement', label: 'Engagement Rate', category: 'Engagement' },
  ],
  youtube: [
    { key: 'subscribers', label: 'Subscribers', category: 'Audience' },
    { key: 'views', label: 'Views', category: 'Reach' },
    { key: 'watchTime', label: 'Watch Time', category: 'Engagement' },
    { key: 'likes', label: 'Likes', category: 'Engagement' },
    { key: 'comments', label: 'Comments', category: 'Engagement' },
  ],
  tiktok: [
    { key: 'followers', label: 'Followers', category: 'Audience' },
    { key: 'views', label: 'Views', category: 'Reach' },
    { key: 'likes', label: 'Likes', category: 'Engagement' },
    { key: 'shares', label: 'Shares', category: 'Engagement' },
  ],
}

export const WIDGET_SIZES = {
  small: { cols: 1, label: 'Small (1 column)' },
  medium: { cols: 2, label: 'Medium (2 columns)' },
  large: { cols: 4, label: 'Large (full width)' },
}

export const WIDGET_TYPES = [
  { key: 'metric_card', label: 'Number Card', icon: 'Hash', sizes: ['small', 'medium'] },
  { key: 'line_chart', label: 'Line Chart', icon: 'TrendingUp', sizes: ['medium', 'large'] },
  { key: 'bar_chart', label: 'Bar Chart', icon: 'BarChart3', sizes: ['medium', 'large'] },
  { key: 'pie_chart', label: 'Pie Chart', icon: 'PieChart', sizes: ['medium'] },
]
