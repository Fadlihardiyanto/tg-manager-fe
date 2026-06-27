# Handoff — Members Extend Access & Onboarding Refactor

## Goal
Refactor the Members "Extend Access" feature from a hardcoded 30-day duration to a date picker where admins select the exact new expiry date. Also refactored the onboarding god-component (1213 lines) into separate step components.

## Current State

### ✅ Completed

**Onboarding Refactor (P2-17)**
- Split `onboarding-flow.tsx` (1213 lines) into a thin controller + 5 step components under `src/features/onboarding/components/steps/`
- Created `src/app/[locale]/dashboard/error.tsx` error boundary

**Members Action Stubs → Real API (P2-18)**
- Added `ActionResponse` type to `members/api/types.ts`
- 6 stubs replaced with real `apiClient` POST calls (kick, extend, sync, resend-link, bulkKick, bulkExtend)
- All use `getAuthHeaders()` from shared lib

**Members Hydration Mismatch & Hook Order Fix**
- Switched `useQuery` → `useSuspenseQuery` (matches Products/Users pattern)
- Removed `keepPreviousData` from queryOptions
- Removed conditional `useDataTable` call (was after early return)
- Removed `<Suspense>` wrapper from `member-listing.tsx`

**Extend Access Date Picker**
- `service.ts`: `extendAccess(id, newExpiryAt: string)` — sends `{ new_expiry_at }` as full ISO-8601 with timezone offset
- `mutations.ts`: inputs changed from `{ id, days }` to `{ id, newExpiryAt }`
- `cell-action.tsx`: Replaced `AlertDialog` with `<Dialog>` + `<Popover>` + `<Calendar>`
- `bulk-action-bar.tsx`: Same Calendar dialog pattern
- Calendar defaults to member's `expired_at` month, disables past dates
- Fixed date shifting: `format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")` preserves local timezone

**Calendar UX Improvements**
- Nav buttons: `size-7` → `size-9`, chevrons: `size-4` → `size-5`
- Added `z-10`, `pb-3`, `fixedWeeks`, `side='bottom'` for stable layout

### Files Actively Edited (last session)

| File | Purpose |
|------|---------|
| `src/features/members/api/service.ts` | `extendAccess` + `bulkExtendAccess` signatures |
| `src/features/members/api/mutations.ts` | Mutation input types |
| `src/features/members/components/members-table/cell-action.tsx` | Date picker dialog |
| `src/features/members/components/bulk-action-bar.tsx` | Bulk date picker dialog |
| `src/components/ui/calendar.tsx` | Calendar nav button sizing/spacing |

### Previous Files (still relevant, no longer actively edited)

| File | Purpose |
|------|---------|
| `src/features/onboarding/components/onboarding-flow.tsx` | Controller (~360 lines) |
| `src/features/onboarding/components/steps/*.tsx` | 5 step components |
| `src/app/[locale]/dashboard/error.tsx` | Error boundary |
| `src/features/members/components/members-table/index.tsx` | Switched to `useSuspenseQuery` |
| `src/features/members/api/queries.ts` | Removed `keepPreviousData` |
| `src/features/members/components/member-listing.tsx` | Removed `<Suspense>` wrapper |
| `src/lib/query-client.ts` | Already had `shouldDehydrateQuery` for pending |

### Failed Attempts / Rollbacks

| Attempt | Why it failed |
|---------|---------------|
| `useSuspenseQuery` on MembersTable (original) | "Cannot update component (Router)" — `apiClient` → `refreshToken()` → `cookies().set()` during render phase. Fixed later with try-catch in `refreshToken` + bare `catch {}` in `apiClient` |
| `useQuery` with `keepPreviousData` | Caused hydration mismatch: server rendered skeleton, client had dehydrated data → "Hydration failed" error |
| `selectedDate.toISOString()` for date payload | UTC conversion shifted dates by timezone offset (e.g., July 26 WIB → July 25 UTC) |

### Next Steps

1. **Verify the flow end-to-end** — open the Members page, click "Extend Access" on a member, pick a date, confirm, check that:
   - Calendar opens at correct default month
   - Past dates are disabled
   - API receives the correct ISO-8601 string with timezone
   - Toast shows success message
   - Table refreshes with new data

2. **Test bulk extend** — select multiple rows, click "Extend Access...", pick date, confirm

3. **Onboarding** — verify all 5 steps render and submit correctly (was not tested after refactor)

4. **Monitor for regressions** — check that the hydration error and hook order error don't reappear
