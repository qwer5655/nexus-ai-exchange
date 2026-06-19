# Code Quality Audit

## TypeScript Configuration Concerns

| Setting | Current | Recommended | Risk |
|---|---|---|---|
| noImplicitAny | false | true | 29 `any` usages found |
| strictNullChecks | false | true | Null pointer exposure |
| target | ES2017 | ES2022+ | Missing modern features |

## `var` Keyword Usage

**208 lines** use `var` instead of `const`/`let`. This is the dominant style. While not a bug, `var` has function-level scoping which can cause subtle bugs.

## Empty Catch Blocks

**20 instances** of silent error swallowing found:

| File | Count | Context |
|---|---|---|
| authStore.ts | 5 | User state errors hidden |
| credits.ts | 4 | Credit operation errors hidden |
| payment-engine.ts | 2 | Commission distribution errors hidden |
| abuse-control.ts | 2 | Abuse detection errors hidden |
| admin-auth.ts | 2 | Auth fallback errors hidden |
| admin-fetch.ts | 2 | Fetch errors hidden |
| useStore.ts | 1 | Store errors |
| rpc-login/route.ts | 3 | Login logging errors hidden |

## Code Smells

### 1. Inline ECharts Configuration
In `admin/page.tsx`, chart options are built inline with shared mutable references:
```typescript
var opts = { xAxis: { data: [] }, series: [{ data: [] }] }
// opts.series[0].data is mutated in place for each chart
```
Charts are initialized in `useEffect` but **never disposed** — memory leak on unmount.

### 2. Inconsistent Function Styles
Mixes arrow functions, function expressions, and function declarations inconsistently.

### 3. No Test Coverage for Financial Logic
Tests exist only for analytics. Zero tests for:
- Withdrawal operations
- Balance transactions
- Authentication
- Admin authorization
- Payment processing
