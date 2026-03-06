# Status Refactoring - Detailed Changelog

## Phase 1: Database Migration + Backend Types
**Date:** 2026-03-06 18:07 UTC
**Commit:** `99dfb31` (reach_be)
**Author:** Helix

### Files Changed

#### migrations/019_centralize_status_on_campaign_platforms.sql (NEW)
- Drops `campaigns.status` column
- Drops `campaign_posts.status` column
- Adds constraint to `campaign_platforms.status` (valid values: draft, active, paused, completed, failed, archived)
- Creates `campaign_derived_status` VIEW for UI convenience
- Includes verification queries

#### src/core/types/campaign-platform.types.ts
**Added:**
```typescript
export type CampaignPlatformStatus =
  | 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'archived';
```

**Changed:**
- Line 26: `status: CampaignPlatformStatus` (was `status: string`)
- Line 51: `status?: CampaignPlatformStatus` (was `status?: string`)

#### src/core/types/campaign.types.ts
**Removed:**
- Line 19-25: `CampaignStatus` type union (entire export deleted)

**Added:**
```typescript
export type DerivedCampaignStatus =
  | 'draft' | 'active' | 'paused' | 'partially_active'
  | 'completed' | 'failed' | 'archived';

export interface CampaignWithDerivedStatus extends Campaign {
  derivedStatus: DerivedCampaignStatus;
  platformStatuses?: Record<string, string>;
}
```

**Changed:**
- Line 81: Removed `status: CampaignStatus` from Campaign interface
- Line 165: Removed `status?: CampaignStatus` from UpdateCampaignInput

#### src/core/types/campaign-post.types.ts
**Removed:**
- Lines 7-9: `CampaignPostStatus` type union (entire export deleted)

**Changed:**
- Line 23: Removed `status: CampaignPostStatus` from CampaignPost interface
- Line 48: Removed `status?: CampaignPostStatus` from UpdateCampaignPostInput

#### src/services/campaign.service.ts
**Changed:**
- Line 13: Changed import from `CampaignStatus` to `DerivedCampaignStatus, CampaignWithDerivedStatus`
- Line 72: Removed `status: 'draft',` from campaign creation

---

## Phase 2: Frontend Types
**Date:** 2026-03-06 18:16 UTC
**Commit:** `51d31a7` (reach_fe)
**Author:** Helix

### Files Changed

#### lib/types/campaign.types.ts
**Added:**
```typescript
export type DerivedCampaignStatus = 'draft' | 'active' | 'paused' | 'partially_active' | 'completed' | 'failed' | 'archived'
export type CampaignPlatformStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'archived'

/** @deprecated Use DerivedCampaignStatus instead */
export type CampaignStatus = DerivedCampaignStatus

/** @deprecated Use CampaignPlatformStatus instead */
export type PlatformStatus = CampaignPlatformStatus

export interface CampaignWithDerivedStatus extends Campaign {
  derivedStatus: DerivedCampaignStatus
  platformStatuses?: Record<string, CampaignPlatformStatus>
}
```

**Changed:**
- Line 55: `status: CampaignPlatformStatus` in CampaignPlatform interface
- Line 96: Removed `status: CampaignStatus` from Campaign interface
- Line 169: Removed `status?: CampaignStatus` from UpdateCampaignData
- Line 197: `status?: CampaignPlatformStatus` in UpdatePlatformData
- Line 202: `derivedCampaignStatus: DerivedCampaignStatus` in PausePlatformResponse
- Line 207: `derivedCampaignStatus: DerivedCampaignStatus` in ResumePlatformResponse

**Removed:**
- CampaignPost.status field (line 72 deleted)

---

## Phase 3: Migration Fix + Rollback
**Date:** 2026-03-06 18:21 UTC
**Commit:** `9f64a49` (reach_be) - Merged via PR #25
**Author:** Turing

### Files Changed

#### migrations/019_centralize_status_on_campaign_platforms.sql
**Fixed:**
- Changed final `RAISE NOTICE` to be inside a DO block (SQL syntax error fix)

**Before:**
```sql
END $$;

RAISE NOTICE 'Migration 019 completed successfully';
```

**After:**
```sql
END $$;

DO $$
BEGIN
  RAISE NOTICE 'Migration 019 completed successfully';
END $$;
```

#### migrations/019_rollback.sql (NEW)
Complete rollback script that:
1. Drops `campaign_derived_status` view
2. Removes constraint from `campaign_platforms.status`
3. Re-adds `campaigns.status` column with default 'draft'
4. Re-adds `campaign_posts.status` column with default 'draft'
5. Populates status from campaign_platforms (best effort)
6. Re-creates indexes
7. Includes verification queries

---

## Phase 4: Backend Services/Controllers (IN PROGRESS)
**Date:** 2026-03-06 18:23+ UTC
**Status:** Turing working on it (issue #24)
**Expected:** PR within 30-60 minutes

### Planned Changes

#### src/services/campaign.service.ts
**Remove/Fix:**
- Line 126: Remove `status` parameter from `listCampaigns()`
- Line 136: Remove `findByUserAndStatus()` call
- Line 216: Remove `if (input.status !== undefined)` block
- Lines 480, 632, 735, 838: Fix status checks (campaign.status no longer exists)
- Lines 546, 578, 675, 778, 885: Change to update campaign_platforms, not campaigns
- Lines 607, 714, 817, 945, 971: Remove campaign.status assignments

**Add:**
```typescript
async getCampaignWithDerivedStatus(userId: string, campaignId: string): Promise<CampaignWithDerivedStatus>
async listCampaignsWithDerivedStatus(userId: string): Promise<CampaignWithDerivedStatus[]>
async pauseCampaign(userId: string, campaignId: string): Promise<void>
async resumeCampaign(userId: string, campaignId: string): Promise<void>
```

#### src/services/campaign-platform.service.ts (NEW FILE)
```typescript
async pausePlatform(userId: string, campaignPlatformId: string): Promise<CampaignPlatform>
async resumePlatform(userId: string, campaignPlatformId: string): Promise<CampaignPlatform>
async activatePlatform(userId: string, campaignPlatformId: string): Promise<CampaignPlatform>
async updatePlatformStatus(userId: string, campaignPlatformId: string, status: CampaignPlatformStatus): Promise<CampaignPlatform>
```

#### src/repositories/campaign.repository.ts
**Remove:**
- `findByUserAndStatus(userId: string, status: string)` method

#### src/controllers/campaign.controller.ts
**Update:**
- `GET /campaigns` - remove status query param
- `PATCH /campaigns/:id` - remove status from body

**Add:**
- `GET /campaigns/:id/derived-status`
- `POST /campaigns/:id/pause`
- `POST /campaigns/:id/resume`
- `POST /campaigns/:campaignId/platforms/:platformId/pause`
- `POST /campaigns/:campaignId/platforms/:platformId/resume`
- `POST /campaigns/:campaignId/platforms/:platformId/activate`

---

## Phase 5: Frontend Components (PENDING)
**Status:** Awaiting Phase 4 completion
**Estimated:** 1-2 hours after backend ready

### Planned Changes

#### components/dashboard/campaigns/campaign-card.tsx
**Update:**
- Line 59: Change `campaign.status` to `campaign.derivedStatus`
- Lines 68-76: Update pause/resume handlers to use new API
- Lines 165-169: Update partially_active display to show platform breakdown
- Lines 203-239: Update button visibility logic
- Add `failed` status style to STATUS_STYLES

#### components/dashboard/campaigns/[id]/campaign-details.tsx
**Update:**
- Replace `campaign.status` with `campaign.derivedStatus`
- Add platform-level controls (pause/resume/activate per platform)
- Show individual platform status badges
- Add platform status breakdown UI

#### components/dashboard/posts/post-card.tsx (MAYBE)
**If Post.status removed:**
- Remove status badge
- Show contentType badge instead (organic vs promoted)

**If Post.status kept:**
- Keep as-is (status represents publishing lifecycle)

#### lib/api/campaigns.ts
**Add:**
```typescript
export async function getCampaignWithDerivedStatus(campaignId: string): Promise<CampaignWithDerivedStatus>
export async function pauseCampaign(campaignId: string): Promise<void>
export async function resumeCampaign(campaignId: string): Promise<void>
export async function pausePlatform(campaignId: string, platformId: string): Promise<PausePlatformResponse>
export async function resumePlatform(campaignId: string, platformId: string): Promise<ResumePlatformResponse>
export async function activatePlatform(campaignId: string, platformId: string): Promise<CampaignPlatform>
```

---

## Breaking Changes Summary

### Database Schema
- ❌ `campaigns.status` column removed
- ❌ `campaign_posts.status` column removed
- ✅ `campaign_platforms.status` now has constraint
- ✅ `campaign_derived_status` view added

### Backend Types
- ❌ `CampaignStatus` type removed
- ❌ `CampaignPostStatus` type removed
- ✅ `CampaignPlatformStatus` type added
- ✅ `DerivedCampaignStatus` type added
- ✅ `CampaignWithDerivedStatus` interface added

### Frontend Types
- ❌ `Campaign.status` field removed
- ❌ `CampaignPost.status` field removed
- ✅ `CampaignPlatformStatus` type added
- ✅ `DerivedCampaignStatus` type added
- ✅ `CampaignWithDerivedStatus` interface added
- ✅ Backwards-compatible type aliases added

### API Changes (Planned)
- ❌ `GET /campaigns?status=active` - status param removed
- ❌ `PATCH /campaigns/:id {status: 'paused'}` - status field removed
- ✅ `GET /campaigns/:id/derived-status` - NEW
- ✅ `POST /campaigns/:id/pause` - NEW
- ✅ `POST /campaigns/:id/resume` - NEW
- ✅ `POST /campaigns/:campaignId/platforms/:platformId/pause` - NEW
- ✅ `POST /campaigns/:campaignId/platforms/:platformId/resume` - NEW
- ✅ `POST /campaigns/:campaignId/platforms/:platformId/activate` - NEW

---

## Rollback Instructions

If you need to revert these changes:

### 1. Rollback Database
```bash
cd /workspace/group/reach_be
psql $DATABASE_URL -f migrations/019_rollback.sql
```

### 2. Rollback Backend Code
```bash
git revert 99dfb31  # Phase 1
git revert 9f64a49  # Phase 3 (migration fix)
git revert <phase4-commit>  # Phase 4 (when merged)
git push
```

### 3. Rollback Frontend Code
```bash
cd /workspace/group/reach_fe
git revert 51d31a7  # Phase 2
git revert <phase5-commit>  # Phase 5 (when merged)
git push
```

### 4. Verify
- Check campaigns list displays correctly
- Check campaign detail page works
- Try pausing/resuming campaigns
- Verify no console errors

---

## Testing Checklist

After all phases complete:

### Database
- [ ] Migration 019 runs without errors
- [ ] Rollback migration runs without errors (test in dev first!)
- [ ] `campaign_derived_status` view returns correct statuses
- [ ] Constraint on `campaign_platforms.status` prevents invalid values

### Backend API
- [ ] Campaign creation works (no status field)
- [ ] Campaign list returns derived status
- [ ] Campaign detail returns derived status
- [ ] Pause campaign updates all platforms
- [ ] Resume campaign updates all platforms
- [ ] Individual platform controls work
- [ ] TypeScript compiles without errors
- [ ] Tests pass

### Frontend UI
- [ ] Campaign list shows derived status badges
- [ ] Partially active campaigns show platform breakdown
- [ ] Campaign detail shows individual platform statuses
- [ ] Platform-level controls visible and functional
- [ ] Campaign-level pause/resume works
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] UI updates when status changes

### Edge Cases
- [ ] Campaign with no platforms shows "draft"
- [ ] Campaign with all platforms paused shows "paused"
- [ ] Campaign with mix of active/paused shows "partially_active"
- [ ] Campaign with all platforms failed shows "failed"

---

## Performance Monitoring

After deployment, watch for:

### Database
- Slow queries on `campaign_derived_status` view
- Index usage on `campaign_platforms(status)`
- Index usage on `campaign_platforms(campaign_id, status)`

### API
- Response time for campaign list endpoint
- Response time for campaign detail endpoint
- Error rate on new platform control endpoints

### Frontend
- Page load time for campaign list
- Page load time for campaign detail
- JavaScript errors in console
- Failed API calls in network tab

---

## Timeline

| Phase | Start | End | Duration | Status |
|-------|-------|-----|----------|--------|
| 1: DB Migration + Backend Types | 18:07 | 18:11 | 4 mins | ✅ Complete |
| 2: Frontend Types | 18:14 | 18:16 | 2 mins | ✅ Complete |
| 3: Migration Fix + Rollback | 18:13 | 18:23 | 10 mins | ✅ Complete |
| 4: Backend Services | 18:23 | TBD | ~30-60 mins | 🔄 In Progress |
| 5: Frontend Components | TBD | TBD | ~1-2 hrs | ⏳ Pending |
| 6: Testing | TBD | TBD | ~1-2 hrs | ⏳ Pending |
| 7: Deployment | TBD | TBD | ~30 mins | ⏳ Pending |

**Total Estimated Time:** 4-6 hours (from start to production)
**Time Elapsed So Far:** ~20 minutes
**Progress:** ~8% complete
