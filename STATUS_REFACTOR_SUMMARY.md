# Status Refactoring - Complete Summary

## Overview

**Goal:** Centralize all status tracking on `campaign_platforms` table only. Remove status from `campaigns`, `campaign_posts`, and `posts` tables.

**Rationale:** Status represents "execution state on a platform", not "content state" or "campaign metadata". Posts are dumb content units. Campaigns are metadata containers. Only campaign_platforms should have status.

## Architecture Before vs After

### Before
```
posts.status: 'draft' | 'scheduled' | 'published' | 'paused' | 'deleted'
campaigns.status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
campaign_posts.status: 'draft' | 'active' | 'paused' | 'completed'
campaign_platforms.status: string (no constraint)
```

### After
```
posts.status: REMOVED (no status - posts are just content units)
campaigns.status: REMOVED (status derived from platforms)
campaign_posts.status: REMOVED (execution state lives on campaign_platforms)
campaign_platforms.status: 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'archived' (CONSTRAINED)

NEW: campaign_derived_status VIEW (computes campaign status from platform statuses)
```

## Completed Work

### Phase 1: Database & Backend Types ✅

**Commit:** `99dfb31` (reach_be)

**Files changed:**
- `migrations/019_centralize_status_on_campaign_platforms.sql` - Migration script
- `src/core/types/campaign-platform.types.ts` - Added CampaignPlatformStatus type
- `src/core/types/campaign.types.ts` - Removed Campaign.status, added DerivedCampaignStatus
- `src/core/types/campaign-post.types.ts` - Removed CampaignPost.status
- `src/services/campaign.service.ts` - Partially updated (createCampaign fixed)

**Migration changes:**
1. Drop `campaigns.status` column
2. Drop `campaign_posts.status` column
3. Add constraint to `campaign_platforms.status`
4. Create `campaign_derived_status` view

### Phase 2: Frontend Types ✅

**Commit:** `51d31a7` (reach_fe)

**Files changed:**
- `lib/types/campaign.types.ts` - Updated to match backend types

**Changes:**
- Added `CampaignPlatformStatus` type
- Added `DerivedCampaignStatus` type
- Removed `Campaign.status` field
- Removed `CampaignPost.status` field
- Added `CampaignWithDerivedStatus` interface
- Added backwards-compatible type aliases

### Phase 3: Documentation ✅

**Commits:**
- `d9e5e0b` (reach_fe) - Frontend refactor plan
- `3fbb427` (group) - Test plan and commit template

**Files created:**
- `reach_fe/FRONTEND_STATUS_REFACTOR_PLAN.md` - Component update plan
- `group/STATUS_REFACTOR_TEST_PLAN.md` - Comprehensive test scenarios
- `group/.frontend-commit-template.txt` - Commit message template

## In Progress

### Phase 4: Backend Services & Controllers 🔄

**Status:** Turing working on it (started 18:13:45, ~7 mins elapsed)

**GitHub Issue:** #24

**Work to do:**
1. Fix all references to `campaign.status` in campaign.service.ts
2. Remove `findByUserAndStatus()` from campaign.repository.ts
3. Add new methods:
   - `getCampaignWithDerivedStatus()`
   - `listCampaignsWithDerivedStatus()`
   - `pauseCampaign()` - pauses ALL platforms
   - `resumeCampaign()` - resumes ALL platforms
4. Create campaign-platform.service.ts with platform-level controls:
   - `pausePlatform()`
   - `resumePlatform()`
   - `activatePlatform()`
5. Update campaign.controller.ts with new routes:
   - `GET /campaigns/:id/derived-status`
   - `POST /campaigns/:id/pause`
   - `POST /campaigns/:id/resume`
   - `POST /campaigns/:campaignId/platforms/:platformId/pause`
   - `POST /campaigns/:campaignId/platforms/:platformId/resume`
   - `POST /campaigns/:campaignId/platforms/:platformId/activate`

## Pending Work

### Phase 5: Frontend Components

**Files to update:**
- `components/dashboard/campaigns/campaign-card.tsx`
- `components/dashboard/campaigns/[id]/campaign-details.tsx`
- `components/dashboard/posts/post-card.tsx` (maybe - pending clarification)

**Changes needed:**
- Replace `campaign.status` with `campaign.derivedStatus`
- Add platform status breakdown for `partially_active` state
- Add platform-level pause/resume/activate controls
- Update status badge styles (add `failed` state)

### Phase 6: Frontend API Layer

**File to update:**
- `lib/api/campaigns.ts`

**New functions to add:**
- `getCampaignWithDerivedStatus()`
- `pauseCampaign()`
- `resumeCampaign()`
- `pausePlatform()`
- `resumePlatform()`
- `activatePlatform()`

### Phase 7: Testing

**Test plan:** See `STATUS_REFACTOR_TEST_PLAN.md`

**Areas to test:**
- Migration runs without errors
- API endpoints return derived status
- Campaign list shows correct status badges
- Platform-level controls work
- Campaign-level pause/resume works
- Partially active state displays correctly

### Phase 8: Deployment

**Steps:**
1. Run migration 019 on production DB
2. Deploy backend
3. Deploy frontend
4. Verify status displays correctly
5. Monitor for errors

## Open Questions

### 1. Post.status - Keep or Remove?

**Current understanding:**
- Posts have `status: 'draft' | 'scheduled' | 'published' | 'paused' | 'deleted'`
- This represents PUBLISHING lifecycle, not campaign execution state
- Should STAY because it's different from campaign execution status

**Awaiting user confirmation**

### 2. Backend API Response Format

**Questions:**
- Will campaign list endpoint automatically include derivedStatus?
- Or do we need to call `/derived-status` separately?
- What's the performance impact of joining the view?

**Waiting for Turing's implementation**

## Type Definitions Reference

### CampaignPlatformStatus (Single Source of Truth)
```typescript
type CampaignPlatformStatus =
  | 'draft'      // Not yet activated
  | 'active'     // Currently running
  | 'paused'     // Temporarily stopped
  | 'completed'  // Finished (end date/budget reached)
  | 'failed'     // Failed to activate or encountered errors
  | 'archived'   // Archived for history
```

### DerivedCampaignStatus (Computed for UI)
```typescript
type DerivedCampaignStatus =
  | 'draft'           // All platforms draft (or no platforms)
  | 'active'          // All platforms active
  | 'paused'          // All platforms paused
  | 'partially_active'// Mix of active/paused
  | 'completed'       // All platforms completed
  | 'failed'          // All platforms failed
  | 'archived'        // All platforms archived
```

## Derived Status Computation Logic

```sql
CASE
  WHEN no platforms exist THEN 'draft'
  WHEN all platforms = 'draft' THEN 'draft'
  WHEN all platforms = 'active' THEN 'active'
  WHEN all platforms = 'paused' THEN 'paused'
  WHEN all platforms = 'completed' THEN 'completed'
  WHEN all platforms = 'failed' THEN 'failed'
  WHEN all platforms = 'archived' THEN 'archived'
  WHEN any platform = 'active' THEN 'partially_active'
  ELSE 'draft'
END
```

## Status Colors

```typescript
const STATUS_STYLES = {
  draft: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' },
  active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  paused: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  partially_active: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  completed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  failed: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  archived: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-300' },
}
```

## Git History

### Backend (reach_be)
- `99dfb31` - Phase 1: Migration + type updates
- `40d4024` - Add platformName/platformSlug to response (earlier work)
- `67b4aba` - Migration to campaign_platforms schema (earlier work)

### Frontend (reach_fe)
- `d9e5e0b` - Documentation (frontend plan)
- `51d31a7` - Phase 2: Frontend type updates
- `7c9d929` - Dark mode testing (unrelated)
- `ebd393f` - Remove Sync Analytics button (cleanup)
- `0c706e1` - Remove Sync from Google button (cleanup)

### Group (main workspace)
- `3fbb427` - Documentation (test plan, templates)

## Key Principles

1. **Single Source of Truth:** Status lives ONLY on campaign_platforms
2. **Derived Status:** Campaign status is computed, never stored
3. **Platform Independence:** Each platform has its own execution state
4. **UI Convenience:** Derived status view makes UI queries easier
5. **No Content Status:** Posts and campaigns are content/metadata, not execution units

## Rollback Plan

If issues arise:
1. Stop deployments
2. Run rollback migration (re-add status columns)
3. Populate status from platform states
4. Revert backend commits (99dfb31 + Turing's work)
5. Revert frontend commits (51d31a7 + component changes)
6. Verify old functionality restored

See `STATUS_REFACTOR_TEST_PLAN.md` for detailed rollback SQL.

## Next Steps

1. ✅ Wait for Turing to complete backend services (ETA: ~20 mins)
2. ⏳ Get user clarification on Post.status
3. ⏳ Review Turing's PR
4. ⏳ Implement frontend component changes
5. ⏳ Test locally
6. ⏳ Deploy to production
7. ⏳ Monitor and verify

## Timeline

- **Phase 1 (Database & Types):** Completed 18:07 UTC
- **Phase 2 (Frontend Types):** Completed 18:16 UTC
- **Phase 3 (Documentation):** Completed 18:17 UTC
- **Phase 4 (Backend Services):** Started 18:13, ETA ~18:40
- **Phase 5-8:** TBD (depends on Phase 4 completion + user clarification)
