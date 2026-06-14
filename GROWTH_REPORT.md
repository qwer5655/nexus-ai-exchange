# NEXUS AI EXCHANGE — Growth Analytics & User Retention Report

## Summary

| Metric | Tracking Method | Current Status |
|---|---|---|
| Daily Registrations | `profiles.created_at` | Available |
| D1/D7/D30 Retention | `analytics_events.user_id` | Requires event data |
| Weekly Cohort Analysis | `analytics_events` + `profiles` | Requires event data |
| Acquisition Sources | `analytics_events.utm_source` | Requires UTM tracking |
| Conversion Funnel | `analytics_events` | Requires event data |

## New Files

| File | Purpose |
|---|---|
| `supabase/migrations/004_growth.sql` | Add session_id, utm_source, utm_campaign, referrer columns |
| `/api/analytics/growth` | GET — Registration trends + acquisition sources (admin) |
| `/api/analytics/retention` | GET — D1/D7/D30 retention metrics (admin) |
| `/api/analytics/cohort` | GET — Weekly cohort table (admin) |
| `/admin/growth` | Growth analytics page with charts + cohort table |

## User Growth Metrics

- **Daily Registrations**: Bar chart of new user signups over 90 days
- **Total Registrations**: Count from `profiles` table
- **Acquisition Sources**: Breakdown by `utm_source`, `utm_campaign`, and `referrer`

## Retention Metrics

- **D1 Retention**: Users active 1 day after registration
- **D7 Retention**: Users active 7 days after registration
- **D30 Retention**: Users active 30 days after registration

## Cohort Analysis

- Weekly cohorts grouped by registration week
- Shows retention percentage for each subsequent week
- Color-coded: green (50%+), yellow (20-49%), red (< 20%)

## Conversion Funnel

Available in Analytics Dashboard (`/admin/analytics`):
- Page View → Register Click → Registered → First Login → First Deposit → First Unlock

## Integration Guide

### Frontend UTM Tracking
Add to pages:
```typescript
var params = new URLSearchParams(window.location.search)
var utmSource = params.get('utm_source')
// Pass to analytics event
fetch('/api/analytics/event', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventName: 'page_view', eventData: { utm_source: utmSource } })
})
```

### Retention Requirements
Retention requires `analytics_events` to be populated with user actions.
Add tracking calls to key user actions (page_view, login, etc.).

## Technical Notes

- All growth API routes require admin authentication
- Retention data requires at least D+1 days of user activity to show
- Cohort table requires weekly user registration data
- UTM tracking requires frontend implementation