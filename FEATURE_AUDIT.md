# Socisync Feature Audit

## Current State Assessment

### ✅ COMPLETE
| Feature | Status | Location |
|---------|--------|----------|
| Landing page | ✅ | `/` |
| Pricing page | ✅ | `/pricing` |
| Privacy policy | ✅ | `/privacy` |
| Terms of service | ✅ | `/terms` |
| User signup | ✅ | `/signup` |
| User login | ✅ | `/login` |
| Auth callback | ✅ | `/auth/callback` |
| Agency onboarding | ✅ | `/onboarding` |
| Dashboard layout | ✅ | `/dashboard/layout` |
| Dashboard home | ✅ | `/dashboard` |
| Clients list | ✅ | `/dashboard/clients` |
| Add client | ✅ | `/dashboard/clients/new` |
| Client detail | ✅ | `/dashboard/clients/[id]` |
| Meta OAuth | ✅ | `/auth/callback/meta` |
| Meta page selector | ✅ | `/dashboard/connect/meta/select` |
| Meta insights API | ✅ | `/api/insights/meta` |

### ⚠️ PARTIALLY COMPLETE
| Feature | Status | Missing |
|---------|--------|---------|
| Client detail page | ⚠️ | Edit client, delete client |
| Meta insights | ⚠️ | Historical data storage, charts |
| Dashboard stats | ⚠️ | Real aggregated data |

### ❌ NOT STARTED
| Feature | Priority | Complexity |
|---------|----------|------------|
| Reports section | HIGH | High |
| Settings page | HIGH | Medium |
| LinkedIn OAuth | MEDIUM | Medium |
| YouTube OAuth | MEDIUM | Medium |
| TikTok OAuth | LOW | Medium |
| Team members | MEDIUM | Medium |
| Billing/Stripe | HIGH | High |
| Email notifications | LOW | Low |
| White-label | LOW | High |

---

## BUILD CHUNKS

### CHUNK 1: Dashboard Navigation & Settings
**Files to create/modify:**
- `/dashboard/settings/page.tsx` - Agency settings
- `/dashboard/settings/team/page.tsx` - Team members
- `/dashboard/settings/billing/page.tsx` - Subscription management
- Update sidebar navigation

**Features:**
- Edit agency name/logo
- Invite team members
- View/change subscription
- Manage connected platform apps

---

### CHUNK 2: Reports System
**Files to create:**
- `/dashboard/reports/page.tsx` - Reports list
- `/dashboard/reports/new/page.tsx` - Create report wizard
- `/dashboard/reports/[id]/page.tsx` - View/edit report
- `/api/reports/generate/route.ts` - PDF generation API
- `/lib/pdf-generator.ts` - PDF utilities

**Features:**
- Report templates
- Date range selection
- Platform/metric selection
- PDF generation (react-pdf or puppeteer)
- Email delivery
- Report history

---

### CHUNK 3: Client Management Enhancement
**Files to modify:**
- `/dashboard/clients/[id]/page.tsx`
- `/dashboard/clients/[id]/edit/page.tsx` (new)

**Features:**
- Edit client details
- Delete client (with confirmation)
- Archive/unarchive client
- Client notes/history
- Disconnect accounts

---

### CHUNK 4: Data Visualization
**Files to create:**
- `/components/charts/LineChart.tsx`
- `/components/charts/BarChart.tsx`
- `/components/charts/MetricCard.tsx`
- `/lib/chart-utils.ts`

**Features:**
- Time-series charts for metrics
- Comparison to previous period
- Platform breakdown charts
- Export chart as image

---

### CHUNK 5: LinkedIn Integration
**Files to create:**
- `/auth/callback/linkedin/route.ts`
- `/dashboard/connect/linkedin/select/page.tsx`
- `/api/insights/linkedin/route.ts`
- `/lib/linkedin-api.ts`

**Features:**
- OAuth 2.0 flow
- Company page selection
- Follower analytics
- Post performance
- Visitor demographics

---

### CHUNK 6: YouTube Integration
**Files to create:**
- `/auth/callback/youtube/route.ts`
- `/dashboard/connect/youtube/select/page.tsx`
- `/api/insights/youtube/route.ts`
- `/lib/youtube-api.ts`

**Features:**
- Google OAuth
- Channel selection
- Subscriber analytics
- Video performance
- Watch time metrics

---

### CHUNK 7: Background Jobs & Sync
**Files to create:**
- `/api/cron/sync-metrics/route.ts`
- `/lib/sync-manager.ts`

**Features:**
- Daily metric sync (Vercel Cron)
- Token refresh before expiry
- Error handling & retry
- Sync status tracking

---

### CHUNK 8: Billing & Subscriptions
**Files to create:**
- `/api/stripe/webhook/route.ts`
- `/api/stripe/checkout/route.ts`
- `/dashboard/settings/billing/page.tsx`
- `/lib/stripe.ts`

**Features:**
- Stripe Checkout integration
- Subscription plans (Starter/Pro/Enterprise)
- Usage limits by plan
- Invoice history
- Plan upgrade/downgrade

---

## RESEARCH NEEDED

1. **PDF Generation** - Best approach for Next.js (react-pdf vs puppeteer vs external service)
2. **LinkedIn API** - Current scopes available, rate limits, data freshness
3. **YouTube API** - Quota limits, analytics API access requirements
4. **Cron Jobs** - Vercel cron vs external service for reliability
5. **Charts** - recharts vs chart.js vs visx for React

---

## PRIORITY ORDER

1. **CHUNK 1** - Settings (needed for team use)
2. **CHUNK 3** - Client management (basic functionality)
3. **CHUNK 4** - Charts (visual appeal)
4. **CHUNK 2** - Reports (core value prop)
5. **CHUNK 7** - Background sync (data freshness)
6. **CHUNK 5** - LinkedIn (expand platforms)
7. **CHUNK 6** - YouTube (expand platforms)
8. **CHUNK 8** - Billing (monetization)
