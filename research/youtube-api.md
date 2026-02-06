# YouTube Analytics API Research

> Research for SociSync social media reporting tool  
> Last Updated: 2026-02-06

## Table of Contents
- [1. Google Cloud Setup](#1-google-cloud-setup)
- [2. OAuth Scopes](#2-oauth-scopes)
- [3. Available Metrics](#3-available-metrics)
- [4. Quota Limits](#4-quota-limits)
- [5. API Endpoints with Examples](#5-api-endpoints-with-examples)
- [6. Data Freshness/Delays](#6-data-freshnessdelays)

---

## 1. Google Cloud Setup

### Prerequisites
1. **Google Account** - Required to access Google Cloud Console
2. **Google Cloud Project** - Create at [console.cloud.google.com](https://console.cloud.google.com)

### Step-by-Step Setup

#### 1.1 Create a Google Cloud Project
```
1. Go to Google Cloud Console
2. Click "Select a project" → "New Project"
3. Enter project name and create
```

#### 1.2 Enable Required APIs
Enable these APIs in your project:

| API | Purpose |
|-----|---------|
| **YouTube Analytics API** | Retrieve analytics data (views, watch time, demographics) |
| **YouTube Reporting API** | Download bulk reports as CSV files |
| **YouTube Data API v3** | Get channel info, subscriber counts, video metadata |

```
1. Go to APIs & Services → Library
2. Search for each API above
3. Click "Enable" for each
```

#### 1.3 Configure OAuth Consent Screen
```
1. Go to APIs & Services → OAuth consent screen
2. Select "External" user type (for public apps)
3. Fill in app information:
   - App name
   - User support email
   - Developer contact email
4. Add required scopes (see Section 2)
5. Add test users during development
6. Submit for verification before production
```

#### 1.4 Create OAuth 2.0 Credentials
```
1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Select application type:
   - "Web application" for server-side apps
   - "Desktop app" for installed apps
   - "Android" / "iOS" for mobile apps
4. Add authorized redirect URIs
5. Download client_secret.json
```

### Important Notes
- **Verification Required**: Apps using sensitive scopes (like YouTube Analytics) must go through Google's verification process before publishing
- **Test Users**: During development, add test users to access the app before verification
- **PKCE Recommended**: Use PKCE (Proof Key for Code Exchange) for mobile/desktop apps

---

## 2. OAuth Scopes

### YouTube Analytics API Scopes

| Scope | Description | Access Level |
|-------|-------------|--------------|
| `https://www.googleapis.com/auth/yt-analytics.readonly` | View YouTube Analytics reports | User activity metrics (views, likes, watch time) |
| `https://www.googleapis.com/auth/yt-analytics-monetary.readonly` | View monetary reports | User activity + revenue + ad performance metrics |
| `https://www.googleapis.com/auth/youtube` | Manage YouTube account | Required for managing Analytics groups |
| `https://www.googleapis.com/auth/youtube.readonly` | View YouTube account | Required for reports.query method |
| `https://www.googleapis.com/auth/youtubepartner` | Manage YouTube assets | For content owners/partners only |

### Recommended Scopes for SociSync

For a social media reporting tool, use:

```javascript
// Minimum scopes for basic analytics
const SCOPES = [
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/youtube.readonly'
];

// Add this if you need revenue data
// 'https://www.googleapis.com/auth/yt-analytics-monetary.readonly'
```

### Scope Sensitivity
- **yt-analytics.readonly** - Sensitive scope (requires verification)
- **yt-analytics-monetary.readonly** - Sensitive scope (requires verification)
- Apps with sensitive scopes require Google security review

---

## 3. Available Metrics

### 3.1 Core Metrics (Protected by Deprecation Policy)

| Metric | Description | Category |
|--------|-------------|----------|
| `views` | Number of video views | View |
| `estimatedMinutesWatched` | Total minutes watched | Watch Time |
| `averageViewDuration` | Average view length (seconds) | Watch Time |
| `likes` | Number of likes | Engagement |
| `dislikes` | Number of dislikes | Engagement |
| `comments` | Number of comments | Engagement |
| `shares` | Number of shares | Engagement |
| `subscribersGained` | New subscribers | Subscribers |
| `subscribersLost` | Lost subscribers | Subscribers |
| `viewerPercentage` | % of logged-in viewers | Demographics |
| `estimatedRevenue` | Net revenue (Google-sold ads + non-ad) | Revenue |
| `annotationClickThroughRate` | Annotation CTR | Annotations |
| `annotationCloseRate` | Annotation close rate | Annotations |
| `engagedViews` | Views past initial seconds | View |

### 3.2 Subscriber Metrics

| Metric | Description |
|--------|-------------|
| `subscribersGained` | New subscribers in period |
| `subscribersLost` | Unsubscribed users in period |

**Note**: For current total subscriber count, use the **YouTube Data API v3**:
```
GET /youtube/v3/channels?part=statistics&id={CHANNEL_ID}
```
Returns: `statistics.subscriberCount`

### 3.3 Watch Time Metrics

| Metric | Description |
|--------|-------------|
| `estimatedMinutesWatched` | Total minutes watched |
| `estimatedRedMinutesWatched` | YouTube Premium watch time |
| `averageViewDuration` | Average view length (seconds) |
| `averageViewPercentage` | Average % of video watched |

### 3.4 Demographics Dimensions

| Dimension | Values |
|-----------|--------|
| `ageGroup` | age13-17, age18-24, age25-34, age35-44, age45-54, age55-64, age65- |
| `gender` | male, female, user_specified |
| `country` | ISO 3166-1 two-letter codes (US, GB, DE, etc.) |
| `province` | US states (ISO 3166-2 codes like US-CA, US-NY) |
| `city` | City names (available from Jan 1, 2022) |

### 3.5 Traffic Source Metrics

| Dimension | Description |
|-----------|-------------|
| `insightTrafficSourceType` | How viewers found the video |
| `insightTrafficSourceDetail` | Specific referrer details |

**Traffic Source Types**:
- `YT_SEARCH` - YouTube search
- `EXT_URL` - External website
- `RELATED_VIDEO` - Related videos
- `SUBSCRIBER` - Subscription feeds
- `PLAYLIST` - Playlist views
- `NOTIFICATION` - YouTube notifications
- `SHORTS` - Shorts feed
- `ADVERTISING` - YouTube ads
- `END_SCREEN` - End screen elements

### 3.6 Revenue & Ad Performance Metrics

| Metric | Description |
|--------|-------------|
| `estimatedRevenue` | Total estimated net revenue |
| `estimatedAdRevenue` | Net revenue from Google-sold ads |
| `estimatedRedPartnerRevenue` | YouTube Premium revenue |
| `grossRevenue` | Gross revenue (before revenue share) |
| `cpm` | Revenue per 1,000 ad impressions |
| `playbackBasedCpm` | Revenue per 1,000 playbacks |
| `adImpressions` | Number of ad impressions |
| `monetizedPlaybacks` | Playbacks with at least one ad |

### 3.7 Playlist Metrics

| Metric | Description |
|--------|-------------|
| `playlistViews` | Views within playlist context |
| `playlistStarts` | Times playlist playback was initiated |
| `playlistEstimatedMinutesWatched` | Watch time in playlist context |
| `playlistSaves` | Net saves of playlist |
| `averageTimeInPlaylist` | Average time spent in playlist |

### 3.8 Livestream Metrics

| Metric | Description |
|--------|-------------|
| `averageConcurrentViewers` | Average concurrent viewers |
| `peakConcurrentViewers` | Peak concurrent viewers |

---

## 4. Quota Limits

### YouTube Analytics API Quota

The YouTube Analytics API uses a **quota system** shared with YouTube Data API:

| Resource | Quota Cost |
|----------|------------|
| Default daily quota | **10,000 units/day** |
| Read operations (list/get) | 1 unit |
| Write operations (create/update/delete) | 50 units |
| Search requests | 100 units |
| Video uploads | 1600 units |

### Analytics API Specific

- **reports.query** method: ~1-5 units per call (depends on complexity)
- **groups.list/insert/update/delete**: Standard CRUD costs
- **Rate limiting**: Not explicitly documented, but excessive calls may be throttled

### YouTube Reporting API (Bulk Reports)

- No explicit per-query quota
- Reports are generated daily as CSV files
- Reports available for **60 days** (30 days for historical backfill)
- Up to **500 items** per Analytics group

### Quota Management Tips

1. **Cache responses** - Store data to reduce repeated API calls
2. **Use bulk reports** - For large datasets, use Reporting API instead of Analytics API
3. **Request only needed fields** - Use `fields` parameter to reduce response size
4. **Batch requests** - Combine multiple video IDs in one request (up to 500)
5. **Monitor usage** - Check quota in Google Cloud Console → APIs & Services → Quotas

### Requesting Quota Increases

If 10,000 units/day is insufficient:
1. Go to [YouTube API Services Quota Extension Request Form](https://support.google.com/youtube/contact/yt_api_form)
2. Provide use case details
3. YouTube reviews on case-by-case basis

---

## 5. API Endpoints with Examples

### 5.1 YouTube Analytics API - reports.query

**Base URL**: `https://youtubeanalytics.googleapis.com/v2/reports`

#### Basic Channel Stats
```http
GET https://youtubeanalytics.googleapis.com/v2/reports
  ?ids=channel==MINE
  &startDate=2024-01-01
  &endDate=2024-01-31
  &metrics=views,estimatedMinutesWatched,averageViewDuration,likes,comments,shares,subscribersGained,subscribersLost
```

#### Views by Country
```http
GET https://youtubeanalytics.googleapis.com/v2/reports
  ?ids=channel==MINE
  &startDate=2024-01-01
  &endDate=2024-01-31
  &dimensions=country
  &metrics=views,estimatedMinutesWatched
  &sort=-views
  &maxResults=10
```

#### Daily Views Trend
```http
GET https://youtubeanalytics.googleapis.com/v2/reports
  ?ids=channel==MINE
  &startDate=2024-01-01
  &endDate=2024-01-31
  &dimensions=day
  &metrics=views,estimatedMinutesWatched,subscribersGained
  &sort=day
```

#### Demographics (Age & Gender)
```http
GET https://youtubeanalytics.googleapis.com/v2/reports
  ?ids=channel==MINE
  &startDate=2024-01-01
  &endDate=2024-01-31
  &dimensions=ageGroup,gender
  &metrics=viewerPercentage
```

#### Top 10 Videos
```http
GET https://youtubeanalytics.googleapis.com/v2/reports
  ?ids=channel==MINE
  &startDate=2024-01-01
  &endDate=2024-01-31
  &dimensions=video
  &metrics=views,estimatedMinutesWatched,likes,subscribersGained
  &sort=-views
  &maxResults=10
```

#### Traffic Sources
```http
GET https://youtubeanalytics.googleapis.com/v2/reports
  ?ids=channel==MINE
  &startDate=2024-01-01
  &endDate=2024-01-31
  &dimensions=insightTrafficSourceType
  &metrics=views,estimatedMinutesWatched
  &sort=-views
```

#### Device Type Breakdown
```http
GET https://youtubeanalytics.googleapis.com/v2/reports
  ?ids=channel==MINE
  &startDate=2024-01-01
  &endDate=2024-01-31
  &dimensions=deviceType
  &metrics=views,estimatedMinutesWatched
```

### 5.2 YouTube Reporting API (Bulk Reports)

**Base URL**: `https://youtubereporting.googleapis.com/v1`

#### List Available Report Types
```http
GET https://youtubereporting.googleapis.com/v1/reportTypes
```

#### Create a Reporting Job
```http
POST https://youtubereporting.googleapis.com/v1/jobs

{
  "reportTypeId": "channel_basic_a3",
  "name": "My Channel Basic Report"
}
```

#### List Jobs
```http
GET https://youtubereporting.googleapis.com/v1/jobs
```

#### List Reports for a Job
```http
GET https://youtubereporting.googleapis.com/v1/jobs/{jobId}/reports
```

#### Download Report
```http
GET {downloadUrl from report}
Accept-Encoding: gzip
```

### 5.3 YouTube Data API v3 (for Subscriber Count)

**Base URL**: `https://www.googleapis.com/youtube/v3`

#### Get Channel Statistics
```http
GET https://www.googleapis.com/youtube/v3/channels
  ?part=statistics,snippet
  &id={CHANNEL_ID}
  &key={API_KEY}
```

**Response includes**:
```json
{
  "statistics": {
    "viewCount": "1234567890",
    "subscriberCount": "1000000",
    "hiddenSubscriberCount": false,
    "videoCount": "500"
  }
}
```

### 5.4 Code Examples

#### Python - Get Basic Analytics
```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Assumes you have OAuth credentials
creds = Credentials.from_authorized_user_file('token.json', SCOPES)
youtube_analytics = build('youtubeAnalytics', 'v2', credentials=creds)

response = youtube_analytics.reports().query(
    ids='channel==MINE',
    startDate='2024-01-01',
    endDate='2024-01-31',
    metrics='views,estimatedMinutesWatched,subscribersGained,subscribersLost',
    dimensions='day',
    sort='day'
).execute()

for row in response.get('rows', []):
    print(f"Date: {row[0]}, Views: {row[1]}, Watch Time: {row[2]} min")
```

#### JavaScript/Node.js - Get Demographics
```javascript
const { google } = require('googleapis');

async function getYouTubeAnalytics(auth) {
  const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth });
  
  const response = await youtubeAnalytics.reports.query({
    ids: 'channel==MINE',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    dimensions: 'ageGroup,gender',
    metrics: 'viewerPercentage'
  });
  
  return response.data;
}
```

---

## 6. Data Freshness/Delays

### YouTube Analytics API (Real-time Queries)

| Data Type | Typical Delay | Notes |
|-----------|---------------|-------|
| Views | **24-72 hours** | Standard processing delay |
| Watch Time | **24-72 hours** | Same as views |
| Engagement (likes, comments) | **24-48 hours** | May vary |
| Demographics | **24-72 hours** | Subject to privacy thresholds |
| Revenue | **3-5 days** | Subject to month-end adjustments |
| Subscriber changes | **24-48 hours** | Daily aggregation |

### YouTube Reporting API (Bulk Reports)

| Aspect | Details |
|--------|---------|
| Report Generation | **Once per day** |
| First Report Available | **48 hours** after job creation |
| Data Coverage | Each report covers a **24-hour period** (12:00 AM - 11:59 PM Pacific) |
| Report Availability | **60 days** from generation |
| Historical Reports | Available for **30 days** prior to job creation |
| Backfill Reports | May be generated to replace/correct previous data |

### Important Timing Notes

1. **Time Zone**: All dates are in **Pacific Time (UTC-7 or UTC-8)**
   - 24-hour period: 12:00 AM to 11:59 PM Pacific

2. **Revenue Data**:
   - Subject to **month-end adjustments**
   - Does NOT include partner-sold advertising
   - Final revenue figures may differ from estimates

3. **Data Completeness**:
   - API returns data "up until the last day for which all metrics are available"
   - If you request data through July 5 but metrics are only available through July 3, you get data through July 3

4. **Real-time vs Historical**:
   - For near-real-time: YouTube Studio shows data with ~1-2 hour delay
   - API data is typically 24-72 hours behind

5. **Privacy Thresholds**:
   - Some dimensions are anonymized if metrics don't meet thresholds
   - Geographic data may be limited for low-traffic videos
   - Demographics may show NULL for small sample sizes

### Best Practices for Data Freshness

1. **Don't query for today's data** - It won't be available
2. **Allow 2-3 day buffer** for complete data
3. **Use `startDate` 3+ days ago** for reliable metrics
4. **Check response dates** - API response indicates actual data range returned
5. **Handle backfill** - Reports may be replaced with corrected data
6. **Store report IDs** - To avoid reprocessing same reports

---

## Summary for SociSync Implementation

### Recommended API Strategy

1. **For real-time dashboard**: YouTube Analytics API
   - Good for on-demand queries
   - Flexible filtering and dimensions
   - ~10,000 units/day quota

2. **For historical analysis**: YouTube Reporting API
   - Bulk CSV downloads
   - Complete datasets
   - Better for data warehousing

3. **For channel metadata**: YouTube Data API v3
   - Current subscriber count
   - Video metadata
   - Channel information

### Key Metrics for Social Media Reporting

| Metric Category | Key Metrics |
|-----------------|-------------|
| **Reach** | views, videoThumbnailImpressions |
| **Engagement** | likes, comments, shares, subscribersGained |
| **Watch Time** | estimatedMinutesWatched, averageViewDuration |
| **Audience** | viewerPercentage by ageGroup, gender, country |
| **Growth** | subscribersGained, subscribersLost |
| **Performance** | averageViewPercentage, views/impressions |

### Authentication Flow

1. User clicks "Connect YouTube"
2. Redirect to Google OAuth consent
3. User grants permissions (scopes)
4. Receive authorization code
5. Exchange for access + refresh tokens
6. Store refresh token securely
7. Use access token for API calls
8. Refresh when expired (tokens last ~1 hour)

---

## References

- [YouTube Analytics API Documentation](https://developers.google.com/youtube/analytics)
- [YouTube Reporting API Documentation](https://developers.google.com/youtube/reporting)
- [YouTube Data API v3 Documentation](https://developers.google.com/youtube/v3)
- [OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Sample API Requests](https://developers.google.com/youtube/analytics/sample-requests)
- [Metrics Reference](https://developers.google.com/youtube/analytics/metrics)
- [Dimensions Reference](https://developers.google.com/youtube/analytics/dimensions)
