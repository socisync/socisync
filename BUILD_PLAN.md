# Socisync MVP Build Plan

## Overview
Social media management & reporting platform for digital marketing agencies.

**Target Launch:** 2-3 weeks from now
**First Customer:** Echelon Media (dogfooding)

---

## Phase 1: Core Platform ✅ COMPLETE
- [x] Auth (Supabase)
- [x] Agency onboarding
- [x] Multi-tenant database schema
- [x] Dashboard layout
- [x] Client management (CRUD)
- [x] Connected accounts data model

---

## Phase 2: Meta Integration (Facebook + Instagram)
**Status:** In Progress

### 2.1 OAuth Flow ✅
- [x] Facebook Login setup
- [x] OAuth callback handler
- [x] Page selection UI
- [x] Save connections to database

### 2.2 Fetch Page Insights
- [ ] Facebook Page metrics:
  - Page followers/likes
  - Post reach & engagement
  - Page views
- [ ] Instagram Business metrics:
  - Followers count
  - Profile views
  - Reach & impressions
- [ ] Store in metrics_cache table
- [ ] Background sync (daily)

### 2.3 Display Metrics
- [ ] Client dashboard with charts
- [ ] Date range selector
- [ ] Comparison to previous period
- [ ] Platform breakdown

---

## Phase 3: Reports
**Status:** Not Started

### 3.1 Report Builder
- [ ] Select client & date range
- [ ] Choose metrics to include
- [ ] Add commentary sections
- [ ] Preview report

### 3.2 PDF Generation
- [ ] Professional template design
- [ ] Charts & graphs
- [ ] Branding (agency logo)
- [ ] Export to PDF

### 3.3 Report Delivery
- [ ] Email reports to clients
- [ ] Schedule recurring reports
- [ ] Report history

---

## Phase 4: LinkedIn Integration
**Status:** Not Started

### 4.1 OAuth
- [ ] LinkedIn App setup
- [ ] OAuth flow
- [ ] Company page selection

### 4.2 Metrics
- [ ] Followers
- [ ] Post impressions
- [ ] Engagement rate
- [ ] Visitor demographics

---

## Phase 5: YouTube Integration
**Status:** Not Started

### 5.1 OAuth
- [ ] Google Cloud project
- [ ] YouTube Data API
- [ ] Channel selection

### 5.2 Metrics
- [ ] Subscribers
- [ ] Views
- [ ] Watch time
- [ ] Top videos

---

## Phase 6: TikTok Ads Integration
**Status:** Not Started (Research in progress)

### 6.1 OAuth
- [ ] TikTok Business Center setup
- [ ] Marketing API app registration
- [ ] OAuth flow implementation

### 6.2 Ads Metrics
- [ ] Campaign performance (impressions, clicks, CTR)
- [ ] Spend and budget data
- [ ] Conversion tracking
- [ ] Audience insights

---

## Phase 7: Polish & Launch
**Status:** Not Started

- [ ] Error handling & edge cases
- [ ] Loading states
- [ ] Mobile responsive
- [ ] Billing (Stripe)
- [ ] Usage limits by plan
- [ ] Onboarding improvements
- [ ] Help docs

---

## API Permissions Required

### Meta (Facebook/Instagram)
- `pages_show_list` - List user's pages
- `pages_read_engagement` - Post engagement data
- `pages_read_user_content` - Page posts
- `read_insights` - Page analytics
- `instagram_basic` - IG account info
- `instagram_manage_insights` - IG analytics

### LinkedIn
- `r_organization_social` - Company page content
- `r_organization_admin` - Admin access check
- `rw_organization_admin` - Company analytics

### YouTube
- `youtube.readonly` - Channel data
- `yt-analytics.readonly` - Analytics data

---

## Tech Stack
- **Frontend:** Next.js 14 (App Router)
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Hosting:** Vercel
- **Domain:** socisync.com

---

## Development Workflow
1. Build & test locally (`npm run dev`)
2. Run `npm run build` to verify no errors
3. Push to main only when feature complete
4. Vercel auto-deploys to production
