# LinkedIn Marketing API Research

> Research compiled: February 2026  
> API Version: li-lms-2026-01  
> Purpose: Social media reporting tool for company page analytics

---

## Table of Contents
1. [Required Scopes for Company Page Analytics](#1-required-scopes-for-company-page-analytics)
2. [OAuth 2.0 Flow Specifics](#2-oauth-20-flow-specifics)
3. [Available Metrics](#3-available-metrics)
4. [Rate Limits and Quotas](#4-rate-limits-and-quotas)
5. [App Review Requirements](#5-app-review-requirements)
6. [API Endpoints with Examples](#6-api-endpoints-with-examples)

---

## 1. Required Scopes for Company Page Analytics

### Primary Permission Required

| Permission | Description | Type |
|------------|-------------|------|
| `rw_organization_admin` | Manage organization pages and retrieve reporting data (including follower, visitor, and content analytics) | 3-legged OAuth |

This is the **core permission** needed for company page analytics. It requires the authenticated member to have the `ADMINISTRATOR` role for the organization.

### API Product: Community Management API

For a social media reporting tool, apply for the **Community Management API** which provides these permissions:

| Permission | Description |
|------------|-------------|
| `r_organization_admin` | Retrieve organization pages and their reporting data |
| `rw_organization_admin` | Manage organizations and retrieve reporting data |
| `r_organization_social` | Retrieve organization posts, comments, likes, and engagement data |
| `r_organization_social_feed` | Read social actions for administered organizations |
| `r_organization_followers` | Access followers' data for mentions |
| `r_basicprofile` | Access member's name, photo, headline, and public profile URL |
| `r_1st_connections_size` | Retrieve number of 1st-degree connections |

### Scope String for OAuth

```
rw_organization_admin r_organization_social r_basicprofile
```

### Important Notes

- User must be an **ADMINISTRATOR** of the Company Page to access analytics
- Some endpoints return limited data for non-admin users (only: id, name, localizedName, vanityName, logoV2, locations, primaryOrganizationType)
- Permissions are granted per API product, not individually

---

## 2. OAuth 2.0 Flow Specifics

### Flow Type: Authorization Code Flow (3-Legged OAuth)

LinkedIn uses the standard OAuth 2.0 Authorization Code Flow for member authorization.

### Step 1: Configure Application

1. Create app at [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Note your **Client ID** and **Client Secret**
3. Add redirect URL (HTTPS required, must be absolute path)

### Step 2: Request Authorization Code

**Endpoint:**
```
GET https://www.linkedin.com/oauth/v2/authorization
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `response_type` | string | Yes | Always `code` |
| `client_id` | string | Yes | Your app's Client ID |
| `redirect_uri` | URL | Yes | Must match registered redirect URL |
| `state` | string | No | CSRF protection (recommended) |
| `scope` | string | Yes | Space-delimited, URL-encoded permissions |

**Example Request:**
```
https://www.linkedin.com/oauth/v2/authorization
  ?response_type=code
  &client_id={your_client_id}
  &redirect_uri=https://your-app.com/callback
  &state=DCEeFWf45A53sdfKef424
  &scope=rw_organization_admin%20r_organization_social%20r_basicprofile
```

**Callback Response:**
```
https://your-app.com/callback?code=AQTQmah11lalyH65DAIivs...&state=DCEeFWf45A53sdfKef424
```

⚠️ **Authorization code expires in 30 minutes**

### Step 3: Exchange Code for Access Token

**Endpoint:**
```
POST https://www.linkedin.com/oauth/v2/accessToken
```

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `grant_type` | string | Yes | Always `authorization_code` |
| `code` | string | Yes | Authorization code from Step 2 |
| `client_id` | string | Yes | Your app's Client ID |
| `client_secret` | string | Yes | Your app's Client Secret |
| `redirect_uri` | URL | Yes | Same as Step 2 |

**Example Request:**
```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code={authorization_code}" \
  -d "client_id={your_client_id}" \
  -d "client_secret={your_client_secret}" \
  -d "redirect_uri=https://your-app.com/callback"
```

**Response:**
```json
{
  "access_token": "AQUvlL_DYEzvT2wz1QJiEPeLioeA...",
  "expires_in": 5184000,
  "refresh_token": "AQWAft_WjYZKwuWXLC5hQlgh...",
  "refresh_token_expires_in": 525600,
  "scope": "rw_organization_admin r_organization_social r_basicprofile"
}
```

### Token Lifetimes

| Token Type | Validity | Notes |
|------------|----------|-------|
| Access Token | **60 days** (5,184,000 seconds) | Used for API calls |
| Refresh Token | **365 days** (525,600 seconds) | For MDP partners only |

### Refresh Token Flow (MDP Partners)

**Endpoint:**
```
POST https://www.linkedin.com/oauth/v2/accessToken
```

**Body:**
```
grant_type=refresh_token
&refresh_token={your_refresh_token}
&client_id={your_client_id}
&client_secret={your_client_secret}
```

⚠️ **Important:** Refresh token TTL does NOT reset. If original refresh token was issued with 365-day TTL and you use it on day 300, the new access token is valid for 60 days but the refresh token expires in 65 days.

### Making Authenticated Requests

```bash
curl -X GET 'https://api.linkedin.com/rest/organizations/12345' \
  -H 'Authorization: Bearer {access_token}' \
  -H 'LinkedIn-Version: 202601' \
  -H 'X-Restli-Protocol-Version: 2.0.0'
```

---

## 3. Available Metrics

### 3.1 Follower Metrics

**Endpoint:** `organizationalEntityFollowerStatistics`

#### Total Follower Count

Use Network Sizes API:
```
GET https://api.linkedin.com/rest/networkSizes/urn:li:organization:{id}?edgeType=COMPANY_FOLLOWED_BY_MEMBER
```

**Response:**
```json
{
  "firstDegreeSize": 219145
}
```

#### Follower Growth (Time-Bound)

| Metric | Description |
|--------|-------------|
| `organicFollowerGain` | New followers from organic sources |
| `paidFollowerGain` | New followers from paid campaigns |

#### Follower Demographics (Lifetime)

| Facet | Description | Max Results |
|-------|-------------|-------------|
| `followerCountsByGeoCountry` | By country/region | Top 100 |
| `followerCountsByGeo` | By market area | Top 100 |
| `followerCountsByFunction` | By job function | Top 100 |
| `followerCountsByIndustry` | By industry | Top 100 |
| `followerCountsBySeniority` | By seniority level | Top 100 |
| `followerCountsByStaffCountRange` | By company size | Top 100 |
| `followerCountsByAssociationType` | By employee status | Top 100 |

### 3.2 Post/Share Metrics

**Endpoint:** `organizationalEntityShareStatistics`

| Metric | Type | Description |
|--------|------|-------------|
| `impressionCount` | long | Total impressions |
| `uniqueImpressionsCount` | long | Unique member views |
| `clickCount` | long | Total clicks |
| `likeCount` | long | Total likes (can be negative*) |
| `commentCount` | long | Total comments |
| `shareCount` | long | Total reshares |
| `engagement` | double | (clicks + likes + comments + shares) / impressions |

*`likeCount` can be negative if a member unlikes a sponsored post (unlike counts as organic, but original like was paid)

**Available for:**
- Aggregate statistics (all posts)
- Individual share/UGC post statistics
- Time-bound (DAY/MONTH granularity)
- Rolling 12-month window

### 3.3 Page View Metrics

**Endpoint:** `organizationPageStatistics`

| Metric | Description |
|--------|-------------|
| `allPageViews` | Total page views (mobile + desktop) |
| `allDesktopPageViews` | Desktop page views only |
| `allMobilePageViews` | Mobile page views only |
| `overviewPageViews` | Overview tab views |
| `careersPageViews` | Careers tab views (paid feature) |
| `jobsPageViews` | Jobs tab views |
| `lifeAtPageViews` | Life tab views |

**Demographics for Page Views:**
- By country (`pageStatisticsByGeoCountry`)
- By function (`pageStatisticsByFunction`)
- By industry (`pageStatisticsByIndustryV2`)
- By seniority (`pageStatisticsBySeniority`)
- By company size (`pageStatisticsByStaffCountRange`)

### 3.4 Engagement Metrics Summary

| Category | Metrics Available |
|----------|-------------------|
| **Reach** | Impressions, Unique impressions, Page views |
| **Engagement** | Clicks, Likes, Comments, Shares, Engagement rate |
| **Growth** | Follower gains (organic/paid) |
| **Demographics** | Country, Industry, Function, Seniority, Company size |
| **Time Analysis** | Daily, Weekly, Monthly granularity |

---

## 4. Rate Limits and Quotas

### Rate Limit Structure

LinkedIn implements two types of rate limits:

| Limit Type | Description |
|------------|-------------|
| **Application-level** | Total calls your app can make per day |
| **Member-level** | Calls per member token per app per day |

### Key Characteristics

- Limits reset at **midnight UTC** daily
- Rate-limited requests receive **HTTP 429** response
- LinkedIn may return 429 for infrastructure protection
- Limits vary by endpoint (not published publicly)

### Finding Your Rate Limits

1. Go to [Developer Portal](https://www.linkedin.com/developers/apps)
2. Select your application
3. Navigate to **Analytics** tab
4. View usage and limits for endpoints you've called today

⚠️ Endpoints only appear after at least 1 request

### Rate Limit Alerts

- Email alerts sent when app exceeds **75% of quota**
- Alerts sent only for application-level breaches
- ~1-2 hour delay after threshold is reached

### Community Management API Tier Limits

| Tier | App Daily Limit | Member Daily Limit | Batch Operations |
|------|-----------------|-------------------|------------------|
| **Development** | 500 API calls | 100 calls per member | Not allowed |
| **Standard** | No restrictions | No restrictions | Allowed |

### Best Practices

1. **Cache responses** - Reduce redundant API calls
2. **Use batch endpoints** - Combine multiple lookups (Standard tier only)
3. **Implement exponential backoff** - Handle 429 responses gracefully
4. **Monitor usage** - Use Developer Portal analytics
5. **Spread requests** - Avoid bursts, distribute throughout day

---

## 5. App Review Requirements

### Access Tiers

| Tier | Purpose | Duration | Restrictions |
|------|---------|----------|--------------|
| **Development** | Build and test | 12 months to complete | 500 app calls/day, 100 per member/day |
| **Standard** | Production use | Ongoing | No restrictions |

### Development Tier Requirements

1. **Business Verification:**
   - Business email address (verified)
   - Organization's legal name
   - Registered address
   - Website URL
   - Privacy policy URL

2. **LinkedIn Page Association:**
   - A LinkedIn Page must be associated with your app
   - Super admin of that Page must [verify](https://www.linkedin.com/help/linkedin/answer/a548360) your application

3. **Application Requirements:**
   - App name cannot include "LinkedIn" or "Microsoft" branding
   - Must not include portions of LinkedIn/Microsoft logos

4. **Use Case Compliance:**
   - Review [restricted use cases](https://learn.microsoft.com/en-us/linkedin/marketing/restricted-use-cases)
   - Only commercial use cases from registered legal organizations

### Standard Tier Requirements

All Development tier requirements PLUS:

1. **Completed Integration:**
   - Fully integrated Community Management APIs
   - Core functionality working

2. **Application Form:**
   - Company and product overview
   - Detailed use case description
   - Test credentials for reviewers

3. **Screen Recording/Screencast:**
   - High resolution
   - Downloadable format
   - Only your application screens (close other windows)
   - Narration recommended
   - Demonstrate OAuth flow and key functionality

### Screencast Requirements by Use Case

#### Page Analytics Use Case

Must demonstrate:
- [ ] Complete OAuth flow (user granting access)
- [ ] How post performance metrics are displayed
- [ ] What personal data fields are shown from member profiles
- [ ] Any other functionality using LinkedIn member data

### Review Timeline

- LinkedIn reviews applications at their discretion
- No guaranteed approval even if requirements are met
- Rejection requires creating a **new app** and reapplying
- Cannot reapply with rejected app

### Compliance Requirements

After approval, you must:
- Comply with [LinkedIn Marketing API Terms](https://www.linkedin.com/legal/l/marketing-api-terms)
- Follow [data storage requirements](https://learn.microsoft.com/en-us/linkedin/marketing/data-storage-requirements)
- LinkedIn may monitor and revoke access for non-compliance

---

## 6. API Endpoints with Examples

### Required Headers (All Requests)

```http
Authorization: Bearer {access_token}
LinkedIn-Version: 202601
X-Restli-Protocol-Version: 2.0.0
```

### 6.1 Organization Lookup

**Get organization details:**
```bash
GET https://api.linkedin.com/rest/organizations/{organization_id}
```

**Response:**
```json
{
  "vanityName": "example-company",
  "localizedName": "Example Company",
  "organizationType": "PUBLIC_COMPANY",
  "id": 12345678,
  "$URN": "urn:li:organization:12345678"
}
```

**Find organization by vanity name:**
```bash
GET https://api.linkedin.com/rest/organizations?q=vanityName&vanityName=linkedin
```

### 6.2 Follower Count

**Get total follower count:**
```bash
GET https://api.linkedin.com/rest/networkSizes/urn:li:organization:{id}?edgeType=COMPANY_FOLLOWED_BY_MEMBER
```

**Response:**
```json
{
  "firstDegreeSize": 219145
}
```

### 6.3 Follower Statistics

**Lifetime follower demographics:**
```bash
GET https://api.linkedin.com/rest/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:12345678
```

**Time-bound follower gains (daily):**
```bash
GET https://api.linkedin.com/rest/organizationalEntityFollowerStatistics
  ?q=organizationalEntity
  &organizationalEntity=urn%3Ali%3Aorganization%3A12345678
  &timeIntervals=(timeRange:(start:1704067200000,end:1704672000000),timeGranularityType:DAY)
```

**Response (time-bound):**
```json
{
  "elements": [
    {
      "timeRange": {
        "start": 1704067200000,
        "end": 1704153600000
      },
      "followerGains": {
        "organicFollowerGain": 223,
        "paidFollowerGain": 12
      },
      "organizationalEntity": "urn:li:organization:12345678"
    }
  ]
}
```

### 6.4 Share/Post Statistics

**Lifetime aggregate share statistics:**
```bash
GET https://api.linkedin.com/rest/organizationalEntityShareStatistics
  ?q=organizationalEntity
  &organizationalEntity=urn%3Ali%3Aorganization%3A12345678
```

**Response:**
```json
{
  "elements": [
    {
      "totalShareStatistics": {
        "uniqueImpressionsCount": 9327,
        "clickCount": 109276,
        "engagement": 0.00754947,
        "likeCount": 52,
        "commentCount": 70,
        "shareCount": 0,
        "impressionCount": 14490816
      },
      "organizationalEntity": "urn:li:organization:12345678"
    }
  ]
}
```

**Time-bound share statistics:**
```bash
GET https://api.linkedin.com/rest/organizationalEntityShareStatistics
  ?q=organizationalEntity
  &organizationalEntity=urn%3Ali%3Aorganization%3A12345678
  &timeIntervals=(timeRange:(start:1704067200000,end:1704672000000),timeGranularityType:DAY)
```

**Statistics for specific posts:**
```bash
GET https://api.linkedin.com/rest/organizationalEntityShareStatistics
  ?q=organizationalEntity
  &organizationalEntity=urn%3Ali%3Aorganization%3A12345678
  &shares=List(urn%3Ali%3Ashare%3A7132564752928563200,urn%3Ali%3Ashare%3A7132402731377438720)
```

### 6.5 Page Statistics

**Lifetime page views:**
```bash
GET https://api.linkedin.com/rest/organizationPageStatistics
  ?q=organization
  &organization=urn:li:organization:12345678
```

**Time-bound page views:**
```bash
GET https://api.linkedin.com/rest/organizationPageStatistics
  ?q=organization
  &organization=urn%3Ali%3Aorganization%3A12345678
  &timeIntervals=(timeRange:(start:1704067200000,end:1704672000000),timeGranularityType:DAY)
```

**Response (lifetime with demographics):**
```json
{
  "elements": [
    {
      "organization": "urn:li:organization:12345678",
      "totalPageStatistics": {
        "views": {
          "allPageViews": { "pageViews": 17786 },
          "allDesktopPageViews": { "pageViews": 17321 },
          "allMobilePageViews": { "pageViews": 465 },
          "overviewPageViews": { "pageViews": 17781 }
        }
      },
      "pageStatisticsByGeoCountry": [...],
      "pageStatisticsByFunction": [...],
      "pageStatisticsBySeniority": [...]
    }
  ]
}
```

### 6.6 Organization Access Control

**Find organizations user administers:**
```bash
GET https://api.linkedin.com/rest/organizationAcls
  ?q=roleAssignee
  &role=ADMINISTRATOR
  &state=APPROVED
```

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Create LinkedIn Developer Application
- [ ] Apply for Community Management API access
- [ ] Set up redirect URLs
- [ ] Implement OAuth 2.0 flow
- [ ] Store refresh tokens securely

### Phase 2: Development Tier
- [ ] Implement organization lookup
- [ ] Implement follower statistics retrieval
- [ ] Implement share statistics retrieval
- [ ] Implement page statistics retrieval
- [ ] Build dashboard/reporting UI
- [ ] Test with multiple organizations

### Phase 3: Standard Tier
- [ ] Complete integration
- [ ] Record screencast demonstration
- [ ] Prepare test credentials
- [ ] Submit Standard tier application
- [ ] Await approval

### Phase 4: Production
- [ ] Monitor rate limits
- [ ] Implement caching strategy
- [ ] Set up refresh token rotation
- [ ] Handle token expiration gracefully
- [ ] Monitor API deprecations/migrations

---

## Resources

- [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
- [Marketing API Documentation](https://learn.microsoft.com/en-us/linkedin/marketing/)
- [Community Management APIs](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/)
- [OAuth 2.0 Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
- [API Migrations](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/migrations)
- [Developer Support Portal](https://linkedin.zendesk.com/hc/en-us)
- [Postman Collection](https://www.postman.com/linkedin-developer-apis/workspace/linkedin-marketing-solutions-versioned-apis/overview)
