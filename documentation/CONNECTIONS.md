# System Connection Map

## Data Flow Chains

### Text Messages
ENV: CHART_UPDATE_INTERVAL → 
Hook: useRelationshipChartData → 
Component: Chart.Timeline → 
Page: /messages → 
Route: /api/relationship/data

### Relationship Timeline
ENV: CHART_UPDATE_INTERVAL → 
Hook: useRelationshipChartData → 
Component: Chart.Timeline → 
Page: /dashboard → 
Route: /api/relationship/data

### Message Analysis
ENV: DATA_FETCH_INTERVAL → 
Hook: useMessageData → 
Component: Table.Messages → 
Page: /analytics → 
Route: /api/messages

## Quick Edit Guide

### To Change Chart Colors:
1. Update `.env.local` - CHART_COLOR_*
2. Restart dev server
3. All charts update automatically

### To Add New Chart Type:
1. Add to `useChartConfig` types array
2. Create `Chart.[NewType].tsx`
3. Add data transformation to relevant hook
4. Import in dashboard page

### To Modify Data Refresh:
1. Update ENV: DATA_FETCH_INTERVAL
2. Hook automatically picks up change