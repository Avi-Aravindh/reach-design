# Status Refactoring Test Plan

## Test Environment Setup

### 1. Run Migration 019
```bash
cd /workspace/group/reach_be
# Connect to Supabase and run migration
npx supabase db push
```

### 2. Verify Migration Success
```sql
-- Check campaigns table has no status column
SELECT column_name FROM information_schema.columns
WHERE table_name = 'campaigns' AND column_name = 'status';
-- Expected: 0 rows

-- Check campaign_posts table has no status column
SELECT column_name FROM information_schema.columns
WHERE table_name = 'campaign_posts' AND column_name = 'status';
-- Expected: 0 rows

-- Check campaign_platforms has status with constraint
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'campaign_platforms'
AND constraint_name = 'campaign_platforms_status_check';
-- Expected: 1 row

-- Check derived status view exists
SELECT table_name FROM information_schema.views
WHERE table_name = 'campaign_derived_status';
-- Expected: 1 row
```

## Backend API Tests

### Test 1: Create Campaign (No Status)
```bash
curl -X POST http://localhost:3001/api/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "objective": "traffic",
    "budgetType": "daily",
    "budgetAmount": 100
  }'
```

**Expected:** Campaign created without status field

### Test 2: Add Platform to Campaign (Status = Draft)
```bash
curl -X POST http://localhost:3001/api/campaigns/$CAMPAIGN_ID/platforms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platformId": "$GOOGLE_ADS_PLATFORM_ID",
    "budgetAllocation": 50,
    "budgetType": "daily"
  }'
```

**Expected:** Platform created with `status: 'draft'`

### Test 3: Get Campaign with Derived Status
```bash
curl -X GET http://localhost:3001/api/campaigns/$CAMPAIGN_ID/derived-status \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
```json
{
  "id": "...",
  "name": "Test Campaign",
  "objective": "traffic",
  "derivedStatus": "draft",
  "platformStatuses": {
    "google": "draft"
  },
  "platforms": [
    {
      "id": "...",
      "platformSlug": "google",
      "status": "draft",
      "budgetAllocation": 50
    }
  ]
}
```

### Test 4: Activate Platform
```bash
curl -X POST http://localhost:3001/api/campaigns/$CAMPAIGN_ID/platforms/$PLATFORM_ID/activate \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- Platform status changes to `active`
- Campaign derived status changes to `active`

### Test 5: Pause Platform
```bash
curl -X POST http://localhost:3001/api/campaigns/$CAMPAIGN_ID/platforms/$PLATFORM_ID/pause \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- Platform status changes to `paused`
- Campaign derived status changes to `paused`

### Test 6: Partially Active State (Multiple Platforms)
```bash
# Add second platform
curl -X POST http://localhost:3001/api/campaigns/$CAMPAIGN_ID/platforms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platformId": "$META_PLATFORM_ID",
    "budgetAllocation": 50,
    "budgetType": "daily"
  }'

# Activate first platform
curl -X POST http://localhost:3001/api/campaigns/$CAMPAIGN_ID/platforms/$PLATFORM_1_ID/activate \
  -H "Authorization: Bearer $TOKEN"

# Keep second platform paused
# Now check derived status
curl -X GET http://localhost:3001/api/campaigns/$CAMPAIGN_ID/derived-status \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
```json
{
  "derivedStatus": "partially_active",
  "platformStatuses": {
    "google": "active",
    "meta": "draft"
  }
}
```

### Test 7: Pause Entire Campaign
```bash
curl -X POST http://localhost:3001/api/campaigns/$CAMPAIGN_ID/pause \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- ALL platform statuses change to `paused`
- Campaign derived status changes to `paused`

### Test 8: Resume Entire Campaign
```bash
curl -X POST http://localhost:3001/api/campaigns/$CAMPAIGN_ID/resume \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- ALL platform statuses change to `active`
- Campaign derived status changes to `active`

## Frontend UI Tests

### Test 1: Campaign List View
1. Navigate to `/dashboard/campaigns`
2. Verify campaign cards show derived status badge
3. Create campaign with multiple platforms in different states
4. Verify "Partially Active" badge shows with platform breakdown

### Test 2: Campaign Detail View
1. Navigate to `/dashboard/campaigns/:id`
2. Verify derived status displays in header
3. Verify each platform shows its own status badge
4. Verify platform-level controls are visible:
   - "Activate" button for draft platforms
   - "Pause" button for active platforms
   - "Resume" button for paused platforms

### Test 3: Platform-Level Controls
1. Click "Activate" on a draft platform
2. Verify platform status changes to active
3. Verify campaign derived status updates
4. Click "Pause" on an active platform
5. Verify platform status changes to paused
6. If other platforms still active, verify derived status = "partially_active"

### Test 4: Campaign-Level Controls
1. Click "Pause Campaign" button
2. Verify ALL platforms change to paused
3. Verify campaign derived status = "paused"
4. Click "Resume Campaign" button
5. Verify ALL platforms change to active
6. Verify campaign derived status = "active"

### Test 5: Status Color Coding
Verify status badges use correct colors:
- Draft: Gray
- Active: Green
- Paused: Yellow
- Partially Active: Orange
- Completed: Blue
- Failed: Red
- Archived: Gray (muted)

### Test 6: Post Cards (If Post.status removed)
1. Navigate to posts list
2. Verify posts show contentType badge (Organic/Promoted) instead of status
3. Verify no campaign execution status displayed on posts

## Edge Cases

### Edge Case 1: Campaign with No Platforms
```sql
SELECT * FROM campaign_derived_status WHERE campaign_id = '...';
```

**Expected:** `derivedStatus: 'draft'`

### Edge Case 2: All Platforms Completed
```sql
UPDATE campaign_platforms SET status = 'completed' WHERE campaign_id = '...';
SELECT * FROM campaign_derived_status WHERE campaign_id = '...';
```

**Expected:** `derivedStatus: 'completed'`

### Edge Case 3: All Platforms Failed
```sql
UPDATE campaign_platforms SET status = 'failed' WHERE campaign_id = '...';
SELECT * FROM campaign_derived_status WHERE campaign_id = '...';
```

**Expected:** `derivedStatus: 'failed'`

### Edge Case 4: Mix of Failed and Active
```sql
UPDATE campaign_platforms SET status = 'failed' WHERE id = 'platform_1';
UPDATE campaign_platforms SET status = 'active' WHERE id = 'platform_2';
SELECT * FROM campaign_derived_status WHERE campaign_id = '...';
```

**Expected:** `derivedStatus: 'partially_active'` (active takes precedence over failed)

## Rollback Plan

If issues are found in production:

1. **Stop deployments immediately**
2. **Rollback database migration:**
   ```sql
   -- Re-add status columns
   ALTER TABLE campaigns ADD COLUMN status TEXT DEFAULT 'draft';
   ALTER TABLE campaign_posts ADD COLUMN status TEXT DEFAULT 'draft';

   -- Populate from platform statuses
   UPDATE campaigns c
   SET status = (
     SELECT CASE
       WHEN COUNT(*) = 0 THEN 'draft'
       WHEN COUNT(*) FILTER (WHERE status = 'active') > 0 THEN 'active'
       WHEN COUNT(*) FILTER (WHERE status = 'paused') > 0 THEN 'paused'
       ELSE 'draft'
     END
     FROM campaign_platforms
     WHERE campaign_id = c.id
   );
   ```

3. **Rollback backend code** - revert commits 99dfb31 and Turing's changes
4. **Rollback frontend code** - revert commit 51d31a7
5. **Verify old functionality restored**

## Success Criteria

- [ ] Migration 019 runs without errors
- [ ] All backend API tests pass
- [ ] All frontend UI tests pass
- [ ] No TypeScript compilation errors
- [ ] No console errors in browser
- [ ] Status displays correctly in all views
- [ ] Platform-level controls work as expected
- [ ] Campaign-level controls work as expected
- [ ] Derived status computes correctly for all states
- [ ] No data loss or corruption

## Performance Considerations

- **Derived status view** - Uses NOT EXISTS clauses which should be fast with proper indexes
- **Index on campaign_platforms.status** - Created in migration for fast filtering
- **Index on campaign_platforms(campaign_id, status)** - Created for optimal join performance

## Monitoring After Deployment

Watch for:
- Slow queries on `campaign_derived_status` view
- Errors in campaign list/detail pages
- Incorrect status displays
- Failed pause/resume operations
- Platform activation failures

If any issues, check:
1. Database logs for query performance
2. Application logs for API errors
3. Browser console for frontend errors
4. Network tab for failed API calls
