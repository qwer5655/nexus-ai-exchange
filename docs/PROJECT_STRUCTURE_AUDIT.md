# Project Structure Audit — NEXUS AI EXCHANGE

## Overview
Full-stack FIFA arbitrage trading platform. Architecture: Pure Next.js 15 (Django removed 2026-06-14).

## Source Tree

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (landing)/          ← EMPTY (no layout/page files)
│   ├── (main)/             # User-facing pages (17 routes)
│   │   ├── admin/          ← DUPLICATE: another admin route group
│   │   ├── ai-center/
│   │   ├── dashboard/
│   │   ├── deposit/
│   │   ├── leaderboard/
│   │   ├── matches/
│   │   ├── my-opportunities/
│   │   ├── news/
│   │   ├── opportunities/
│   │   ├── opportunity/[id]/
│   │   ├── profile/
│   │   ├── referral/
│   │   ├── schedule/
│   │   ├── setup/
│   │   ├── support/
│   │   ├── vip/
│   │   └── withdraw/
│   ├── admin/              # Admin panel (20 pages)
│   ├── api/                # API routes (70+ handlers)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Tailwind CSS v4
├── components/             # React components
│   ├── achievements/       ← EMPTY
│   ├── admin/              # AdminComponents.tsx (9KB)
│   ├── ai/                 # AICenterDashboard.tsx
│   ├── auth/               # 8 auth components (Login, Register, etc.)
│   ├── background/         # BootSequence, GridOverlay, WorldCupBackground
│   ├── charts/             # ProfitChart.tsx
│   ├── dashboard/          ← EMPTY
│   ├── deposit/            # CryptoIcon, DepositModal
│   ├── hero/               # HeroSection.tsx
│   ├── layout/             # Header, Footer, HUDPanels, etc.
│   ├── leaderboard/        # LeaderboardTable.tsx
│   ├── news/               # NewsCenter.tsx
│   ├── onboarding/         ← EMPTY
│   ├── opportunities/      # MatchModal, OpportunityTable (+ .bak file)
│   ├── player/             # PlayerImage, PlayersSection
│   ├── profile/            ← EMPTY
│   ├── referral/           ← EMPTY
│   ├── schedule/           # ScheduleBracket.tsx
│   ├── stats/              # LiveStats, TrustBar
│   └── ui/                 ← EMPTY
├── data/                   # Static data modules (matches, news, players, etc.)
├── hooks/                  ← EMPTY DIRECTORY
├── lib/                    # Core utilities (14 modules)
├── middleware.ts           # Next.js middleware
├── services/               # Business logic layer (8 modules)
├── store/                  # Zustand stores
└── types/                  # TypeScript definitions
```

## Empty Directories (8)
| Directory | Impact |
|---|---|
| src/hooks/ | No custom hooks — minor, but unusual |
| src/components/achievements/ | Feature planned but unimplemented |
| src/components/dashboard/ | No dedicated dashboard components — logic in page |
| src/components/onboarding/ | Feature planned but unimplemented |
| src/components/profile/ | Feature planned but unimplemented |
| src/components/referral/ | Feature planned but unimplemented |
| src/components/ui/ | No shared UI primitives |
| src/app/(landing)/ | Landing route group — root page.tsx serves as landing |

## Duplicate Patterns
| Issue | Details |
|---|---|
| Admin route group | Both `(main)/admin/` and `admin/` exist with different layouts — possible confusion |
| backup file | `OpportunityTable.tsx.bak` (11KB) left in source |

## Deprecated/Django Legacy
- Django fully removed per commit 2970a7c
- `deploy/proxy.js` references Django proxy config — obsolete
- `deploy/nginx.sh` may still reference old architecture

## Root-Level Artifacts
- 13+ individual SQL fix scripts (not part of migration chain)
- 5 MD reports (deployment, growth, release gate, etc.)
- 10+ startup scripts (.bat, .ps1, .vbs, .js, .mjs)
- These should be cleaned up before production deployment
