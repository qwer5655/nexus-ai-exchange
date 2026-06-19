# DATA INTEGRITY AUDIT REPORT

**Date:** 2026-06-18
**Build:** npm run build — PASS ✅ (135 pages)
**Scope:** Frontend, API, Data flow — full audit

---

## CRITICAL FINDINGS

### FINDING C-1: Dashboard Stats are Hardcoded Fake Values 🔴 HIGH

**Location:** `src/store/useStore.ts` (lines 60-65)
```typescript
stats: {
  todayOpportunities: 1283,     // ← FAKE: never updated from API
  onlineTraders: 3629,          // ← FAKE
  detectedMarkets: 87491,       // ← FAKE: "8,741 markets scanned" is made up
  theoreticalProfit: 847235,    // ← FAKE
  averageYield: 3.87,           // ← FAKE
  countriesConnected: 127,      // ← FAKE
}
```
**Risk:** These values are shown on the homepage (HeroSection) and dashboard. They are NEVER overridden by real API calls. The `fetchStats` function fetches from `/api/health` which only returns system health, not these stats. These values are presented as real-time data.

### FINDING C-2: Leaderboard API Generates Random Win Rates 🔴 HIGH

**Location:** `src/app/api/public/leaderboard/route.ts` (line ~25)
```typescript
var winRate = Math.min(95, Math.floor(65 + (p.vip_level || 0) * 3 + Math.random() * 10))
```
**Risk:** Every API request generates different win rate values. The leaderboard component polls and re-renders, showing "changing" win rates. This simulates user activity that doesn't exist.

### FINDING C-3: Matches API Generates Random Scores 🔴 HIGH

**Location:** `src/app/api/public/matches/route.ts` (lines 18-20)
```typescript
score = Math.floor(Math.random()*4)+"-"+Math.floor(Math.random()*4);
```
**Risk:** Each page refresh generates completely new match scores. Live matches get random scores, finished matches get random scores. The data is fully fabricated.

### FINDING C-4: Deposit Plans API Has Hardcoded Fallback 🔴 MEDIUM

**Location:** `src/app/api/public/deposit-plans/route.ts`
```typescript
var defaultPlans = [
  { id: "D1", amount: 20, bonus: "No bonus", popular: false },
  // ... 6 hardcoded plans
]
// If DB table query fails or returns empty, returns defaultPlans as real data
return NextResponse.json({ success: true, data: { plans: defaultPlans } })
```
**Risk:** The API first tries to read from the `deposit_plans` table. If the table doesn't exist (SQL was created as a file but never run), or if the query returns empty, the API silently returns hardcoded data. The frontend treats this as real database data. User cannot distinguish between DB data and hardcoded fallback.

---

## FALLBACK & MOCK RESIDUAL LIST

| # | File | Pattern | Risk | Type |
|---|---|---|---|---|
| 1 | `src/store/useStore.ts:60-65` | Hardcoded stats defaults | HIGH | Fake analytics |
| 2 | `src/app/api/public/leaderboard/route.ts` | `Math.random()` winRate | HIGH | Fake data generation |
| 3 | `src/app/api/public/matches/route.ts` | `Math.random()` scores | HIGH | Fake data generation |
| 4 | `src/app/api/public/deposit-plans/route.ts` | Hardcoded `defaultPlans` fallback | MEDIUM | Silent fallback |
| 5 | `src/app/api/public/news/route.ts` | Reads `announcements` table (wrong table) | MEDIUM | Wrong data source |
| 6 | `src/data/leaderboard.ts` | `Math.random()` profits | LOW | File unused by component |
| 7 | `src/data/winning-feed.ts` | `Math.random()` entries | LOW | File unused by component |
| 8 | `src/app/api/public/players/route.ts` | Empty array fallback | MEDIUM | Returns no data |
| 9 | `src/app/api/public/categories/route.ts` | Empty array catch | LOW | Table may not exist |
| 10 | `src/app/api/public/tags/route.ts` | Empty array catch | LOW | Table may not exist |
| 11 | `src/app/api/public/banners/route.ts` | Empty array catch | LOW | Table may not exist |

---

## MODULE TRUST SCORE TABLE

| Module | Trust Score | Data Source | DB Table Exists? | Risk |
|---|---|---|---|---|
| **Wallet** | **95/100** | wallets table | Yes (sql/021) | Clean |
| **Winning Feed** | **95/100** | activity_feed + unlocks + deposits | Yes | Clean |
| **Leaderboard** | **80/100** | profiles (total_profit) + Math.random(winRate) | Yes | Random winRate |
| **Notifications** | **80/100** | notifications table | Yes (001_schema) | Clean |
| **Opportunities** | **75/100** | opportunities table | Yes (001_schema) | Data may be seeded |
| **Deposit Plans** | **50/100** | Hardcoded fallback | No (sql file only) | Silent fallback |
| **Site Settings** | **50/100** | site_settings table | No (sql/018 only) | May not exist |
| **Subscription Plans** | **50/100** | subscription_plans table | No (sql/011 only) | May not exist |
| **Players** | **30/100** | Empty catch | No | Always empty |
| **News** | **30/100** | announcements table | No | Wrong table |
| **Banners** | **30/100** | Empty catch | No | Always empty |
| **Categories** | **20/100** | Empty catch | No (sql/017 only) | Always empty |
| **Tags** | **20/100** | Empty catch | No (sql/017 only) | Always empty |
| **Matches** | **10/100** | Math.random() | N/A | Completely fake |
| **Dashboard Stats** | **0/100** | Hardcoded | N/A | Fake values |
| **Conversion Analytics** | **0/100** | Hardcoded admin | N/A | Fake values |
| **VIP Tiers page** | **0/100** | Hardcoded array | N/A | Hardcoded UI |

---

## DATA FLOW TRACE SUMMARY

### ✅ TRUSTED (Real DB, no fallbacks)
```
Wallet:     Admin CRUD → wallets table → /api/public/wallets → DepositModal
Winning:    Auto-generated → activity_feed/unlocks/deposits → /api/public/winning-feed → WinningFeed
Leaderboard: Auto-generated → profiles (total_profit) → /api/public/leaderboard → LeaderboardTable
Notif:      Admin CRUD → notifications table → /api/notifications → NotificationCenter
```

### ⚠️ FALLBACK CHAIN EXISTS (May show fake data)
```
Deposit:    Admin CRUD → deposit_plans table → QUERY FAILS → hardcoded defaultPlans → Frontend
News:       Admin CRUD? → announcements table → QUERY FAILS → { news: [] } → Frontend (empty)
Players:    No admin → players table → QUERY FAILS → { players: [] } → Frontend (empty)
Settings:   Admin CRUD → site_settings table → QUERY FAILS → { settings: {} } → Header/Footer (defaults)
Plans:      Admin CRUD → subscription_plans → QUERY FAILS → { plans: [] } → VIP page (nothing)
```

### ❌ FAKE DATA (Deliberate mock)
```
Matches:    /api/public/matches → Math.random() scores → Schedule page
Dashboard:  useStore hardcoded stats → HeroSection (shows fake numbers)
Leaderboard: profiles + Math.random(winRate) → every request changes values
Analytics:  admin/conversion → hardcoded static array → admin page
```

---

## VERDICT

| Metric | Value |
|---|---|
| **Modules with real DB data** | 4 out of 17 (23.5%) |
| **Modules with fallback chain** | 6 out of 17 (35.3%) |
| **Modules with fully fake data** | 4 out of 17 (23.5%) |
| **Modules with empty/unavailable tables** | 3 out of 17 (17.6%) |
| **Overall data authenticity** | **~35%** |
| **Frontend-to-Backend connection rate** | **~70%** (pipeline exists) |
| **Actual real data displayed to users** | **~35%** (data in DB is real) |

### System is NOT fully data-trustable.

The architecture is API-driven and the pipelines exist (>70% connected), but the actual DATA in those pipelines is often empty (tables don't exist) or fallback-based. Many SQL table definitions exist as files but were never executed in the database.

**Key blocking issues for data trust:**
1. Dashboard stats are hardcoded fake values (never overridden)
2. Match scores are `Math.random()` generated
3. 6 modules rely on tables that may not exist (fallback to empty or fake data)
4. Deposit plans silently fall back to hardcoded data
5. News API reads from the wrong table (announcements instead of news)
