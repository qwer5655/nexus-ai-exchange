# Phase 1 ！ Crash Source Report

## Root Cause Analysis: Failed to execute 'insertBefore' on 'Node'

### Primary Crash Source (HIGH ！ CONFIRMED)

**File:** src/components/auth/AuthModalManager.tsx:17-21
**Component:** AuthModalManager
**Risk:** CRITICAL
**Trigger:** When isAuthModalOpen transitions from 	rue to alse (modal close), **all 3 conditional children** (RegisterModal, LoginModal, ForgotPasswordModal) vanish simultaneously inside a single <AnimatePresence>. This causes Framer Motion to:
1. Keep the exiting DOM nodes alive for exit animation
2. Try to insertBefore new sibling nodes during reconciliation
3. Fail because the original parent-child relationships no longer exist

**Why it crashes:**
- No mode="wait" on the <AnimatePresence>
- Each child has its own **inner <AnimatePresence>** (nested), creating DOM conflicts
- When isAuthModalOpen flips to alse, React removes all three conditions at once
- AnimatePresence tries to force-remove multiple nodes simultaneously, leading to insertBefore on a node that is no longer a child of its parent

**Also:** Each child modal (RegisterModal, LoginModal, ForgotPasswordModal) already contains its own <AnimatePresence mode="wait">, making the outer AnimatePresence redundant and harmful.

### Secondary Crash Source (HIGH ！ CONFIRMED)

**File:** src/components/opportunities/MatchModal.tsx:14-128
**Component:** MatchModal
**Risk:** HIGH
**Trigger:** <AnimatePresence> wraps a **keyless Fragment** <>...</> containing 2 <motion.div> children (backdrop + content). Fragment provides no key, so AnimatePresence cannot track children during exit. When showMatchModal changes, both children try to exit as a keyless group, causing insertBefore failure.

**Why it crashes:**
- <>...</> inside <AnimatePresence> is not supported by Framer Motion
- No stable key for AnimatePresence to track siblings
- Exit animations of backdrop + content collide during React reconciliation

### Tertiary Risk (MEDIUM)

**File:** src/components/deposit/DepositModal.tsx:37-39
**Component:** DepositModal
**Risk:** MEDIUM
**Issue:** if (!showDepositModal) return null (line 37) short-circuits before <AnimatePresence> can run exit animations. When the modal closes, the entire component unmounts abruptly. The <AnimatePresence> wrapping 2 children (backdrop + content) never fires exit animations. While this does not directly cause insertBefore, it creates an unstable DOM transition path.

### Other AnimatePresence Usages (LOW RISK ！ OK)

| File | Usage | Risk | Reason |
|------|-------|------|--------|
| NotificationCenter.tsx | Single <motion.div> child | SAFE | Correct single-child pattern |
| Header.tsx (x3) | Each wraps single child | SAFE | Correct single-child pattern |
| OpportunityTable.tsx | key={opp.id} unique keys | SAFE | Stable keys, single row exit |
| BootSequence.tsx | Single wrapper child | SAFE | Correct single-child pattern |

### Canvas Background (LOW RISK ！ OK)

| File | Usage | Issue |
|------|-------|-------|
| WorldCupBackground.tsx | <canvas> with useEffect + cleanup | Proper lifecycle, no direct DOM manipulation |
| BootSequence.tsx | <canvas> with useEffect + cleanup | Proper lifecycle, no direct DOM manipulation |

Both use useEffect with proper cleanup (cancelAnimationFrame, emoveEventListener). No direct document.body.appendChild or emoveChild found.

### key={index} Findings (LOW PRIORITY)

Static/hardcoded arrays use key={i} or key={index}, which is safe for stable lists. No dynamic arrays with unstable keys found in crash-relevant paths.

### Summary

| # | File | Line | Risk | Root Cause |
|---|------|------|------|------------|
| 1 | AuthModalManager.tsx | 17-21 | CRITICAL | 3 children in single AnimatePresence, nested AnimatePresence, no mode="wait" |
| 2 | MatchModal.tsx | 14-128 | HIGH | Fragment inside AnimatePresence, no keys |
| 3 | DepositModal.tsx | 37-39 | MEDIUM | Early return before AnimatePresence, exit animations never fire |

