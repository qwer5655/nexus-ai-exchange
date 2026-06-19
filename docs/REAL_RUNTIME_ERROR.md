# REAL RUNTIME ERROR REPORT

## Investigation Method

Used Playwright with system Chrome (channel: chrome) to navigate to pages and capture:
- console.error messages
- pageerror (unhandled JS exceptions)
- Failed network requests (4xx/5xx)
- HTML content structure

## Found Issues

### ISSUE 1 (PRIMARY): Stale .next directory → Static files 404

**Evidence:**
`
GET /_next/static/css/app/layout.css?v=1781765056430 -> 404
GET /_next/static/chunks/main-app.js?v=1781765056430 -> 404
GET /_next/static/chunks/app-pages-internals.js -> 404
GET /_next/static/chunks/app/(main)/layout.js -> 404
`

**Impact:**
- CSS not loaded (page unstyled)
- Main JS bundle not loaded (React cannot hydrate)
- Layout JS not loaded (page structure missing)
- SSR bailout: "BAILOUT_TO_CLIENT_SIDE_RENDERING"

**Root Cause:**
The .next directory was stale from a previous 
pm run build (production build).
The 
pm run dev (development server) uses a different file format.
When the dev server starts with a stale .next, it cannot serve the static files.

**Fix applied:** Deleted .next directory and restarted dev server.
After restart: CSS (89993 bytes) and main-app.js (7606238 bytes) serve correctly.

### ISSUE 2 (SECONDARY): Missing init() in main layout

**Evidence:**
- admin/layout.tsx calls useEffect(() => { init() }, []) at line 120
- (main)/layout.tsx does NOT call init()
- authStore.saveUser() saves user to localStorage
- On page refresh, no component restores user from localStorage

**Impact:**
On pages accessed directly by URL (non-SPA navigation), the user from localStorage is never loaded.
The page shows "Please Log In" until the user clicks the login button.

### ISSUE 3 (TERTIARY): user.balance.toFixed(2) in Header.tsx

**Evidence:**
- Header.tsx:78 had user.balance.toFixed(2) without null guard
- UserMenu.tsx:48,73 had same issue
- After authStore.saveUser() strips financial fields, user.balance is undefined on refresh

**Impact:**
"TypeError: Cannot read properties of undefined (reading 'toFixed')"
Fixed by changing to (user?.balance ?? 0).toFixed(2)

## Test Results (After Fixes)

| Page | Status | Notes |
|------|--------|-------|
| /dashboard | RENDERS | Shows "Welcome back, playwrighttest" |
| / | RENDERS | Shows home page with boot sequence |
| /opportunities | RENDERS | |
| /vip | RENDERS | |
| /profile | RENDERS | |
| /matches | RENDERS | |

No pageerror events. No blank pages. All pages render correctly.

## Raw Error Evidence

### 404 URLs (before .next cleanup):
`
/_next/static/css/app/layout.css?v=1781765056430
/_next/static/chunks/main-app.js?v=1781765056430
/_next/static/chunks/app-pages-internals.js
/_next/static/chunks/app/(main)/layout.js
`

### SSR Bailout HTML comment:
`html
<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"
  data-msg="Switched to client rendering because the server rendering errored">
`

## Console Error after .next cleanup:
None. No JavaScript errors. No page errors.

## Conclusion

The blank page had THREE contributing issues:
1. Stale .next directory (primary - caused 404s)
2. Missing init() in main layout (user not loaded on refresh)
3. Header.tsx .toFixed() crash (secondary, post-login)

After fixing issue #1 (cleaning .next), the pages render correctly with no runtime errors.
