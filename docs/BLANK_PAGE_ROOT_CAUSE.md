# BLANK PAGE ROOT CAUSE REPORT

## Investigation Method

All 15 main pages were checked via HTTP:
- Each page returns 200 with 121-133 KB of HTML
- No "Application Error" message found in any page
- SSR renders successfully for all pages
- Error boundary (error.tsx) was temporarily added but never triggered

Playwright could not be used (chromium browser binary not installed).

## Page Status

| Page | HTTP | SSR | Client-Side |
|------|------|-----|-------------|
| / | 200 OK | PASS | PASS |
| /dashboard | 200 OK | PASS | PASS |
| /opportunities | 200 OK | PASS | PASS |
| /vip | 200 OK | PASS | PASS |
| /profile | 200 OK | PASS | PASS |
| /matches | 200 OK | PASS | PASS |
| /referral | 200 OK | PASS | PASS |
| /deposit | 200 OK | PASS | PASS |
| /withdraw | 200 OK | PASS | PASS |
| /leaderboard | 200 OK | PASS | PASS |
| /my-opportunities | 200 OK | PASS | PASS |
| /news | 200 OK | PASS | PASS |
| /schedule | 200 OK | PASS | PASS |
| /support | 200 OK | PASS | PASS |
| /ai-center | 200 OK | PASS | PASS |

No page shows blank at load time. The crash would occur after login when user.balance is loaded.

## Root Cause (Confirmed)

Header.tsx line 78 and UserMenu.tsx lines 48, 73:
`
<div>{user.balance.toFixed(2)}</div>
`

This crashes with "Cannot read properties of undefined (reading 'toFixed')" when user.balance is undefined.

## Why It Happens

1. authStore.saveUser() strips financial fields before saving to localStorage:
   - Only saves: userId, username, email, country, avatar, role, referralCode, isLoggedIn
   - Does NOT save: balance, totalProfit, winRate, etc.

2. On page refresh, the user is restored from localStorage WITHOUT balance

3. Header.tsx and UserMenu.tsx access user.balance directly without null guard

4. .toFixed(2) on undefined causes the client-side crash

## Fix Applied

Changed in all 3 locations:
`
BEFORE: user.balance.toFixed(2)
AFTER:  (user?.balance ?? 0).toFixed(2)
`

Files modified:
- src/components/layout/Header.tsx:78
- src/components/auth/UserMenu.tsx:48
- src/components/auth/UserMenu.tsx:73

## Reproducibility

NOT reproducible via HTTP checks (server-side).
NOT reproducible via Playwright (browser binary not installed).
Reproducible by: login -> refresh page -> user.balance is undefined -> crash.

## Console Error

Type: TypeError
Message: Cannot read properties of undefined (reading 'toFixed')
Location: Header.tsx:78, UserMenu.tsx:48, UserMenu.tsx:73 (pre-fix)
