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

### 2.2 Fetch Page Insights ✅
- [x] Facebook Page metrics:
  - Page followers/likes
  - Post reach & engagement
  - Page views
- [x] Instagram Business metrics:
  - Followers count
  - Profile views
  - Reach & impressions
- [x] Store in metrics_cache table
- [ ] Background sync (daily) - needs Vercel cron setup

### 2.3 Display Metrics ✅
- [x] Client dashboard with charts
- [x] Date range selector
- [x] Comparison to previous period
- [x] Platform breakdown
- [x] Client insights page with visualizations

---

## Phase 2.5: Dashboard UI Overhaul ✅ COMPLETE (7 Feb 2026)
- [x] shadcn/ui component library installed
- [x] Command palette (⌘K) with cmdk
- [x] Metric cards with sparklines
- [x] Skeleton loading states
- [x] Enhanced date range picker with presets
- [x] Collapsible sidebar navigation
- [x] Credit balance indicator in header/sidebar

---

## Phase 2.6: Settings Pages ✅ COMPLETE (7 Feb 2026)
- [x] Settings main page with tabs
- [x] Agency settings (branding, colors, logo)
- [x] Team settings (members list, invite modal)
- [x] Billing settings (plans, pricing)
- [x] Credits settings (balance, usage, top-up)
- [x] Integrations settings (connected platforms)

---

## Phase 2.7: Client Management Enhancement ✅ COMPLETE (7 Feb 2026)
- [x] Edit client page (pre-populated form)
- [x] Delete client with confirmation dialog
- [x] Notes/description field on clients
- [x] Connected accounts display with disconnect option

---

## Phase 2.8: Credit System Foundation ✅ COMPLETE (7 Feb 2026)
- [x] Database schema (migration file created)
  - credit_balances table
  - credit_transactions table
  - credit_packages table
  - credit_allocations table
  - credit_alerts table
- [x] Credit balance UI component
- [x] Credit history component
- [x] Credits settings page
- [x] Functions for credit deduction/addition

---

## Phase 3: Reports
**Status:** Partially Complete

### 3.1 Report Builder
- [x] Select client & date range
- [x] Choose metrics to include
- [ ] Add commentary sections (in progress)
- [x] Preview report

### 3.2 PDF Generation
- [x] Professional template design
- [x] Charts & graphs
- [x] Branding (agency logo)
- [x] Export to PDF

### 3.3 Report Delivery
- [ ] Email reports to clients
- [ ] Schedule recurring reports
- [ ] Report history

---

## Phase 4: LinkedIn Integration
**Status:** OAuth Complete, Insights Pending

### 4.1 OAuth
- [x] LinkedIn App setup
- [x] OAuth flow
- [x] Company page selection

### 4.2 Metrics
- [ ] Followers (needs LinkedIn Marketing API approval)
- [ ] Post impressions
- [ ] Engagement rate
- [ ] Visitor demographics

---

## Phase 5: YouTube Integration
**Status:** OAuth Complete, Insights Pending

### 5.1 OAuth
- [x] Google Cloud project
- [x] YouTube Data API
- [x] Channel selection

### 5.2 Metrics
- [ ] Subscribers
- [ ] Views
- [ ] Watch time
- [ ] Top videos

---

## Phase 6: TikTok Ads Integration
**Status:** OAuth Complete, Insights Pending

### 6.1 OAuth
- [x] TikTok Business Center setup
- [x] Marketing API app registration
- [x] OAuth flow implementation

### 6.2 Ads Metrics
- [ ] Campaign performance (impressions, clicks, CTR)
- [ ] Spend and budget data
- [ ] Conversion tracking
- [ ] Audience insights

---

## Phase 7: Polish & Launch
**Status:** In Progress

- [x] Loading states (skeleton screens)
- [x] Mobile responsive (tablet-friendly at minimum)
- [ ] Error handling & edge cases
- [ ] Billing (Stripe integration pending)
- [ ] Usage limits by plan
- [ ] Onboarding improvements
- [ ] Help docs

---

## API Permissions Required

### Meta (Facebook/Instagram)
- `pages_show_list` - List user's pages ✅
- `pages_read_engagement` - Post engagement data ✅
- `pages_read_user_content` - Page posts ✅
- `read_insights` - Page analytics ✅
- `instagram_basic` - IG account info ✅
- `instagram_manage_insights` - IG analytics ✅

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
- **UI Components:** shadcn/ui, Radix UI
- **Charts:** Recharts
- **Hosting:** Vercel
- **Domain:** socisync.com

---

## Recent Updates (7 Feb 2026 Overnight Build)

### Completed
1. ✅ Dashboard UI overhaul with shadcn/ui
2. ✅ Command palette (⌘K) for quick navigation
3. ✅ Enhanced metric cards with sparklines
4. ✅ Date range picker with presets
5. ✅ Collapsible sidebar
6. ✅ Full settings pages (agency, team, billing, credits, integrations)
7. ✅ Client insights visualization with Recharts
8. ✅ Credit system database schema
9. ✅ Credit UI components (balance, history)
10. ✅ All pages have proper loading states

### Still Needed
- Stripe integration for billing/credits
- Background job for daily metric sync
- External API keys (LinkedIn, YouTube, TikTok)
- Email notification system
- Full production testing

---

## Development Workflow
1. Build & test locally (`npm run dev`)
2. Run `npm run build` to verify no errors ✅
3. Push to main only when feature complete
4. Vercel auto-deploys to production
