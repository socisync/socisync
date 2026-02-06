# TikTok Marketing API Research

**Last Updated:** 2026-02-06  
**Purpose:** Social media reporting tool integration research for SociSync

---

## Overview

TikTok offers multiple APIs for business use under **TikTok API for Business**:

| API | Purpose |
|-----|---------|
| **Marketing API** | Ads management, reporting, campaign automation |
| **Organic API** | Brand presence, mentions, creator discovery, content insights |
| **Business Messaging API** | Direct messaging with TikTok users |
| **Display API** | Embed user videos/profiles (consumer-facing) |
| **Research API** | Academic/research access (restricted) |

For a reporting tool, we primarily need:
- **Marketing API** for paid ads metrics
- **Organic API** (limited) or **Display API** for organic content metrics

---

## 1. Developer Setup & Business Center

### Registration Process

1. **Create TikTok Developer Account**
   - Register at https://developers.tiktok.com/signup using email
   - Or use https://ads.tiktok.com/marketing_api/homepage for Marketing API

2. **Create/Join an Organization** (recommended)
   - Represents the owning group of the app
   - Go to Developer Portal → Organizations

3. **Connect Your App**
   - Go to Manage apps → Connect an app
   - Select organization as app owner
   - Fill in app details (icon, name, description, platforms)

4. **Business Center Setup** (for Marketing API)
   - Create a Business Center at TikTok Ads Manager
   - Verify your business
   - Link advertiser accounts to Business Center
   - Business Center ID used for multi-account management

### App Configuration

**Required Details:**
- **App Icon:** 1024x1024px, JPEG/JPG/PNG, ≤5MB
- **App Name & Description:** Shown to users during authorization
- **Category:** Helps TikTok understand your app
- **Platforms:** Web, Android, iOS, Desktop (each requires specific URLs)

**Products to Add (for reporting):**
- Ads Management
- Reporting
- Creative Management (optional)

---

## 2. OAuth 2.0 Flow

TikTok uses a **non-standard OAuth 2.0 implementation** (Authorization Code flow).

### Step 1: Get Authorization Code

Redirect user to authorization URL:
```
https://business-api.tiktok.com/portal/auth?app_id={APP_ID}&state={STATE}&redirect_uri={REDIRECT_URI}&scope={SCOPES}
```

Alternative (Advertiser authorization URL from app dashboard):
- User logs in, selects ad accounts to share
- Redirects to your `redirect_uri` with `auth_code` parameter

### Step 2: Exchange Auth Code for Access Token

```http
POST https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/
Content-Type: application/json

{
  "app_id": "YOUR_APP_ID",
  "secret": "YOUR_APP_SECRET",
  "auth_code": "AUTH_CODE_FROM_REDIRECT"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "access_token": "ACCESS_TOKEN_HERE",
    "advertiser_ids": ["6870790075194xxxx", "..."],
    "scope": ["ads_management", "reporting"]
  }
}
```

### Token Characteristics

| Property | Value |
|----------|-------|
| Token Type | Bearer (sent as `Access-Token` header) |
| Expiration | Long-lived (typically does not expire) |
| Refresh | Not required in standard flow |
| Storage | Store securely; one token per authorized user |

### Authentication Headers

```http
Access-Token: {your_access_token}
Content-Type: application/json
```

---

## 3. Ads Reporting Metrics

### Core Metrics Available

| Category | Metrics |
|----------|---------|
| **Basic** | `impressions`, `clicks`, `ctr`, `cost`, `cpc`, `cpm` |
| **Reach** | `reach`, `frequency`, `cost_per_1000_reached` |
| **Conversions** | `conversions`, `conversion_rate`, `cost_per_conversion`, `results`, `cost_per_result` |
| **Video** | `video_play_actions`, `video_watched_2s`, `video_watched_6s`, `video_views_p25/p50/p75/p100`, `average_video_play` |
| **Engagement** | `profile_visits`, `likes`, `comments`, `shares`, `follows`, `engagements` |
| **App Events** | `app_install`, `registration`, `purchase`, `add_to_cart`, `checkout`, `view_content` |
| **Attribution** | `vta_conversion`, `cta_conversion`, `vta_purchase`, `cta_purchase` |
| **Value** | `total_purchase_value`, `complete_payment_roas` |

### Key Dimensions

| Category | Dimensions |
|----------|------------|
| **Entity** | `advertiser_id`, `campaign_id`, `adgroup_id`, `ad_id` |
| **Time** | `stat_time_day`, `stat_time_hour` |
| **Geographic** | `country_code`, `province_id`, `dma_id` |
| **Demographic** | `gender`, `age` |
| **Platform** | `platform`, `placement` |

### Reporting Endpoint

```http
GET https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/
```

**Parameters:**
```
advertiser_id=YOUR_ADVERTISER_ID
report_type=BASIC
data_level=AUCTION_AD|AUCTION_ADGROUP|AUCTION_CAMPAIGN|AUCTION_ADVERTISER
dimensions=["stat_time_day","ad_id"]
metrics=["spend","impressions","clicks","cpc","cpm","ctr","conversions"]
start_date=2024-01-01
end_date=2024-01-31
page_size=1000
page=1
lifetime=false
```

**Example Request:**
```http
GET https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?advertiser_id=6870790075194xxxx&report_type=BASIC&dimensions=["stat_time_day","campaign_id"]&data_level=AUCTION_CAMPAIGN&start_date=2024-01-01&end_date=2024-01-31&metrics=["spend","impressions","clicks","cpc","cpm","ctr","reach","conversions"]&page_size=1000
```

**Response Structure:**
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "list": [
      {
        "dimensions": {
          "stat_time_day": "2024-01-15",
          "campaign_id": "1680018437245954"
        },
        "metrics": {
          "spend": "1265.87",
          "impressions": "3840449",
          "clicks": "45231",
          "cpc": "0.028",
          "cpm": "0.33",
          "ctr": "1.18"
        }
      }
    ],
    "page_info": {
      "page": 1,
      "page_size": 1000,
      "total_page": 3,
      "total_number": 2500
    }
  }
}
```

### Filtering

```json
{
  "filters": [
    {
      "field_name": "campaign_ids",
      "filter_type": "IN",
      "filter_value": "[1680018437245954, 1680018437245955]"
    }
  ]
}
```

---

## 4. Organic Content Metrics

### Limitations

TikTok's **organic metrics are significantly more limited** than paid ads. There is no direct "Organic Reporting API" equivalent to the Marketing API.

### Available via Display API

**User Info (`/v2/user/info/`):**
- `open_id`, `avatar_url`, `display_name`, `profile_deep_link`, `bio_description`
- No follower counts or engagement metrics directly

**Video Metadata (`/v2/video/list/`, `/v2/video/query/`):**
- Video ID, title, description, thumbnail
- Basic counts (views, likes, comments, shares) - **if permitted by user**

### Organic Metrics via Third-Party Aggregators

Third-party tools (Supermetrics, Funnel.io) access organic data via:
- TikTok Business Account API (requires Business Account)
- Metrics available include:
  - `video_views`, `profile_views`, `likes`, `comments`, `shares`
  - `new_followers`, `reached_audience`
  - `video_completion_rate`, `average_view_time`
  - Audience demographics (gender, country distribution)

### Organic API (Beta/Limited)

TikTok's **Organic API** is part of API for Business but with limited availability:
- Content publishing
- Community interaction
- Account insights
- Requires separate approval

---

## 5. Rate Limits & Quotas

### Marketing API Rate Limits

| Tier | Limit | Notes |
|------|-------|-------|
| **Basic** | ~10 QPS | Default for new apps |
| **Advanced** | 20 QPS | Requires approval |
| **Enterprise** | Custom | Contact TikTok |

Rate limits are enforced per app, not per advertiser account.

### Display API Rate Limits

| Endpoint | Limit (per minute) |
|----------|---------------------|
| `/v2/user/info/` | 600 |
| `/v2/video/query/` | 600 |
| `/v2/video/list/` | 600 |

### Research API Limits (if applicable)

- **Daily limit:** 1,000 requests/day
- **Records per request:** 100
- **Daily records:** Up to 100,000/day
- **Reset:** 12 AM UTC

### Rate Limit Response

```http
HTTP/1.1 429 Too Many Requests
```

```json
{
  "code": 40100,
  "message": "Rate limit exceeded"
}
```

**Best Practices:**
- Implement exponential backoff
- Use `page_size=1000` to minimize requests
- Batch operations where possible
- Monitor rate limit headers

---

## 6. App Review & Approval

### Review Timeline

| Stage | Duration |
|-------|----------|
| Initial Review | 2-4 business days |
| Revisions | 1-3 business days |
| Production Approval | After successful review |

### Requirements

1. **Demo Video Required**
   - Show complete end-to-end integration flow
   - Max 5 videos, 50MB each
   - Must demonstrate actual functionality

2. **Sandbox Testing**
   - Use Sandbox mode before submission
   - Test all requested scopes
   - No review required for sandbox

3. **App Details**
   - Clear description of API usage
   - Terms of Service URL
   - Privacy Policy URL
   - All URLs must be verified

4. **URL Verification**
   - Required for production apps
   - Domain or URL prefix verification
   - Download signature file and upload to your server

### Scopes to Request (for reporting tool)

```
ads_management
reporting
creative_management (optional)
```

### Review Statuses

| Status | Meaning |
|--------|---------|
| Draft | Not submitted |
| In review | Pending approval |
| Live | Approved and active |
| Not approved | Rejected (see feedback) |

### Common Rejection Reasons

- Demo video doesn't show integration clearly
- Missing or invalid Privacy Policy/ToS URLs
- Requested scopes not demonstrated in demo
- App description doesn't match functionality

---

## 7. API Endpoints Summary

### Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://business-api.tiktok.com/open_api/v1.3/` |
| Sandbox | Same URL, sandbox access token |

### Key Endpoints

| Purpose | Endpoint | Method |
|---------|----------|--------|
| Get Access Token | `/oauth2/access_token/` | POST |
| List Campaigns | `/campaign/get/` | GET |
| List Ad Groups | `/adgroup/get/` | GET |
| List Ads | `/ad/get/` | GET |
| **Integrated Report** | `/report/integrated/get/` | GET |
| Get Advertiser Info | `/advertiser/info/` | GET |

### Campaign Management Endpoints

```http
# Get all campaigns
GET /campaign/get/?advertiser_id={ID}&page_size=1000

# Get ad groups (with filter)
GET /adgroup/get/?advertiser_id={ID}&filtering={"campaign_ids":["ID1","ID2"]}

# Get ads
GET /ad/get/?advertiser_id={ID}&filtering={"adgroup_ids":["ID1"]}
```

---

## 8. Data Freshness & Delays

### Reporting Latency

| Data Type | Latency |
|-----------|---------|
| **Real-time metrics** | Near real-time (minutes) |
| **Standard reporting** | ~11 hours typical |
| **Offline/final data** | 24-48 hours |
| **Attribution data** | Up to 7 days for complete attribution |

### Key Considerations

1. **Data Reconciliation**
   - Real-time data may be adjusted next day
   - Use 3-day attribution window minimum for incremental syncs
   - Final metrics available after attribution window closes

2. **SKAN Data (iOS)**
   - Additional delays for SKAdNetwork data
   - Can take 24-72 hours for SKAN conversions
   - Build buffer time into reporting schedules

3. **Time Zones**
   - Data aggregated in advertiser's account timezone
   - Specify timezone in queries where applicable

### Recommended Sync Strategy

```
Daily sync:
- Pull data for T-3 to T-1 (3-day lookback)
- Update existing records with refreshed metrics
- Full historical sync: weekly or monthly
```

---

## 9. SDK & Libraries

### Official SDK

**GitHub:** https://github.com/tiktok/tiktok-business-api-sdk

**Supported Languages:**
- Python
- Java
- JavaScript/Node.js

**Python Installation:**
```bash
pip install tiktok-business-api-sdk
```

**Basic Usage:**
```python
from tiktok.business.client import TikTokBusinessClient

client = TikTokBusinessClient(
    access_token='YOUR_ACCESS_TOKEN',
    advertiser_id='YOUR_ADVERTISER_ID'
)

# Get campaigns
campaigns = client.campaign.get(page_size=1000)
```

### Third-Party Libraries

- **PyPI:** `TikTok-Business-API`
- Various open-source wrappers available

---

## 10. Implementation Notes for SociSync

### Recommended Approach

1. **Start with Marketing API** for ads reporting (well-documented, stable)
2. **Add Display API** for basic organic video embedding
3. **Consider Organic API** later (requires separate approval, limited)

### Data Model Mapping

| TikTok Entity | SociSync Concept |
|---------------|------------------|
| Advertiser | Account |
| Campaign | Campaign |
| Ad Group | Ad Set |
| Ad | Ad |

### Key Metrics to Prioritize

**Awareness:**
- Impressions, Reach, Frequency, CPM

**Engagement:**
- Clicks, CTR, Video Views, Video Completion Rate

**Conversion:**
- Conversions, Conversion Rate, Cost per Conversion, ROAS

**Spend:**
- Cost (spend), CPC, Cost per Result

### Error Handling

```json
{
  "code": 40001,
  "message": "Invalid access token"
}
```

Common error codes:
- `0`: Success
- `40001`: Invalid access token
- `40100`: Rate limit exceeded
- `50000`: Internal server error

---

## References

- [TikTok API for Business Portal](https://business-api.tiktok.com/portal/docs)
- [Marketing API Docs](https://ads.tiktok.com/marketing_api/docs)
- [TikTok for Developers](https://developers.tiktok.com/)
- [Display API Overview](https://developers.tiktok.com/doc/display-api-overview)
- [App Review Guidelines](https://developers.tiktok.com/doc/app-review-guidelines/)
- [Rate Limits](https://developers.tiktok.com/doc/tiktok-api-v2-rate-limit)
- [Official SDK](https://github.com/tiktok/tiktok-business-api-sdk)
