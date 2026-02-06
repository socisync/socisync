# Widget System Design

## Database Schema

### client_dashboards
Stores the overall dashboard configuration per client.
- id: uuid
- client_id: uuid (FK to clients)
- name: string (default: "Main Dashboard")
- created_at, updated_at

### dashboard_widgets
Individual widget configurations.
- id: uuid
- dashboard_id: uuid (FK to client_dashboards)
- widget_type: enum (metric_card, line_chart, bar_chart, pie_chart)
- platform: string (meta, linkedin, youtube, tiktok)
- account_id: uuid (FK to connected_accounts, nullable for "all")
- metric: string (followers, reach, impressions, etc.)
- size: enum (small, medium, large)
- position: int (order in dashboard)
- config: jsonb (additional settings like colors, labels)
- created_at, updated_at

## Widget Types

### metric_card (small)
Single number with label and optional change indicator.

### line_chart (medium/large)
Time series visualization.

### bar_chart (medium/large)
Comparison visualization.

### pie_chart (medium)
Distribution visualization.

## Widget Sizes
- small: 1 column (25% width on desktop)
- medium: 2 columns (50% width)
- large: 4 columns (100% width)

## Metrics Available

### Facebook Page
- followers, pageLikes, pageViews, reach, impressions
- postReach, postImpressions, engagements, engagedUsers
- reactions, clicks, videoViews, newLikes, newFollowers

### Instagram
- followers, following, mediaCount, reach, impressions
- profileViews, accountsEngaged, totalInteractions
- likes, comments, shares, saves, websiteClicks
- emailContacts, phoneClicks, getDirectionsClicks
