# Changelog

All notable changes to SociSync will be documented in this file.

## [0.3.0] - 2026-02-07

### 🎨 Dashboard UI Overhaul
This release brings a major visual and functional upgrade to the dashboard experience.

#### Added
- **shadcn/ui Integration** - Modern, accessible UI components throughout the app
- **Command Palette (⌘K)** - Quick navigation and search across clients, pages, and actions
- **Enhanced Metric Cards** - KPI cards now show sparklines and change indicators
- **Skeleton Loading States** - Smooth loading experience for all data-heavy pages
- **Collapsible Sidebar** - Save screen space with keyboard shortcut (⌘\)
- **Date Range Picker** - Presets for common ranges (Today, Last 7 days, This month, etc.)

#### Settings Pages
- **Agency Settings** - Name, logo, branding colors with live preview
- **Team Management** - View members, invite modal (invite flow placeholder)
- **Billing & Plans** - Subscription tier selection, pricing display
- **Credits & Usage** - Balance display, usage history, top-up modal
- **Integrations** - Connected platforms overview with disconnect option

#### Client Management
- **Edit Client** - Full form with industry, notes, active status
- **Delete Client** - Confirmation dialog with cascade delete
- **Client Insights Page** - Full analytics with charts and visualizations
  - Line charts for engagement over time
  - Bar charts for platform comparison
  - Top performing posts display

#### Credit System Foundation
- Database schema for credit-based AI billing:
  - `credit_balances` - Track agency credit allocation
  - `credit_transactions` - Audit log of all credit events
  - `credit_packages` - Purchasable credit packs
  - `credit_allocations` - Agency-to-client distribution
  - `credit_alerts` - Configurable notifications
- Credit balance component (header indicator + detailed popover)
- Transaction history with filtering
- Usage stats dashboard

#### New Components
- `components/ui/metric-card.tsx` - Flexible KPI display
- `components/ui/sparkline.tsx` - SVG mini-charts
- `components/ui/skeleton-card.tsx` - Loading placeholders
- `components/ui/date-range-picker.tsx` - Calendar with presets
- `components/ui/command-palette.tsx` - cmdk-based search
- `components/credits/credit-balance.tsx` - Balance indicator
- `components/credits/credit-history.tsx` - Transaction list

### Changed
- Dashboard layout now includes top header bar with search and credits
- Sidebar navigation uses new active states and hover effects
- All settings pages unified under tabbed navigation
- Primary color scheme updated for better shadcn/ui compatibility

### Fixed
- Proper TypeScript types throughout new components
- Consistent border-radius and spacing via design tokens
- Mobile-friendly improvements to new UI elements

### Technical
- Added dependencies: `cmdk`, `@radix-ui/*`, `tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge`
- CSS variables for theming (light/dark mode ready)
- Database migration file for credit system

---

## [0.2.0] - 2026-02-06

### Added
- Meta (Facebook/Instagram) OAuth integration
- Page and account selection UI
- Meta Insights API endpoint
- Basic widget system for client dashboards
- Report generation with PDF export
- LinkedIn OAuth flow
- YouTube OAuth flow
- TikTok OAuth flow

### Changed
- Improved client detail page with connected accounts strip
- Enhanced dashboard with widget grid

---

## [0.1.0] - 2026-02-05

### Added
- Initial project setup with Next.js 14
- Supabase authentication
- Agency onboarding flow
- Client CRUD operations
- Multi-tenant database schema
- Landing, pricing, privacy, and terms pages
- Basic dashboard layout

---

## Upcoming

### Planned for 0.4.0
- Stripe integration for billing and credit purchases
- Background job system for daily metric sync
- Email notifications for reports and alerts
- LinkedIn insights display (post API approval)
- YouTube analytics integration
