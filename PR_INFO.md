# Pull Request Information

## PR Title
```
feat: UI improvements + Vercel-compatible monitoring + CSV format tracking
```

## PR URL
https://github.com/ccedacero/expense-categorizer/compare/claude/add-category-dropdown-indicator-011CUtrzE6z5oHRVe5B975XA?expand=1

## PR Body

Copy the content below when creating the PR:

---

## Summary

Three key improvements to enhance user experience and production monitoring:

1. **Better category button discoverability** - Visual indicators make it obvious you can click categories
2. **Vercel-compatible monitoring** - Structured metrics that work on serverless
3. **CSV format tracking** - Understand which banks your users prefer

## Changes

### 1. 🎨 Improved Category Button Discoverability

**Problem:** Users didn't realize category buttons were clickable dropdowns.

**Solution:**
- Replaced small text arrow with larger SVG chevron icon
- Added hover effects: border highlight, shadow, arrow scales up
- Added focus ring for better accessibility
- More obvious visual affordance

**File:** `components/results-table.tsx`

### 2. 🔧 Fixed NewRelic on Vercel Serverless

**Problem:** NewRelic APM was throwing errors on Vercel Lambda functions:
- Module not found errors
- Read-only filesystem errors
- Failed initialization

**Solution:**
- Auto-detect Vercel environment (`process.env.VERCEL === '1'`)
- Skip NewRelic APM initialization on Vercel
- Clear logging explaining why and suggesting alternatives

**Files:** `instrumentation.ts`

NewRelic still works great on self-hosted/Docker/VPS!

### 3. 📊 Vercel-Friendly Metrics + CSV Format Tracking

**Problem:** Need usage stats but NewRelic doesn't work on Vercel serverless.

**Solution:**
- Created dual metrics system:
  - Vercel → `lib/vercel-metrics.ts` (structured JSON logging)
  - Self-hosted → `lib/newrelic-metrics.ts` (APM)
- API route auto-detects environment and uses correct backend
- **NEW:** Track CSV format/bank type (Wells Fargo, Chase, Capital One, etc.)

**Files:**
- `lib/vercel-metrics.ts` (NEW)
- `lib/parser.ts` - CSV format detection
- `lib/types.ts` - CSVFormat type
- `app/api/categorize/route.ts` - Track on every upload

**Metrics Tracked:**
- ✅ AI costs per request
- ✅ Cache hit rates
- ✅ Performance (parse time, AI time)
- ✅ **CSV format distribution (NEW!)**
- ✅ Traffic and errors

## Documentation

- 📖 **VERCEL_MONITORING.md** - Complete guide to viewing metrics on Vercel
- 📖 **CSV_FORMAT_TRACKING.md** - Bank format analytics guide
- 📖 **NEWRELIC_SETUP.md** - Updated with Vercel compatibility info

## Viewing Metrics on Vercel

```bash
# View all metrics
vercel logs | grep "type\":\"metric"

# See which banks are most popular
vercel logs | grep "csv.format"
```

**Dashboard:**
1. Vercel Dashboard → Your Project → Logs
2. Filter by: `type="metric"`
3. See structured JSON logs

**For production:** Set up Log Drains to export to Datadog, Axiom, etc.

## Benefits

1. ✅ Works on any platform (Vercel, self-hosted, Docker)
2. ✅ No more Lambda errors from NewRelic
3. ✅ Track user behavior (which banks they use)
4. ✅ Easy to export to any analytics platform
5. ✅ Better UX - users know categories are clickable

## Test Plan

- [x] Test category button hover effects work
- [x] Verify no NewRelic errors on Vercel
- [x] Check structured logs appear in Vercel logs
- [x] Confirm CSV format detection works (Wells Fargo, Chase, etc.)
- [x] Test NewRelic still works on local dev

## Breaking Changes

None - all changes are backwards compatible.
