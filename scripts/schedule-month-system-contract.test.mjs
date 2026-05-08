import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const scheduleClient = read('app/schedule/ScheduleClient.tsx');
const monthStatusHook = read('lib/useMonthStatus.ts');
const batchRoute = read('app/api/shifts/batch/route.ts');

assert(
  /overviewCacheGenerationRef/.test(scheduleClient),
  'Schedule overview cache should use a generation guard to reject stale in-flight responses.'
);

assert(
  /cacheGenerationAtRequest\s*=\s*overviewCacheGenerationRef\.current/.test(scheduleClient)
    && /cacheGenerationAtRequest !== overviewCacheGenerationRef\.current/.test(scheduleClient),
  'loadOverview should capture and compare cache generation before caching fetched data.'
);

assert(
  /currentMonthKeyRef/.test(scheduleClient)
    && /currentMonthKeyRef\.current !== monthKey/.test(scheduleClient),
  'Background month fetches should verify they still target the visible month before setState.'
);

assert(
  /mergeLocalShifts = useCallback\(\(updatedShifts: Shift\[\], monthKey = currentMonthKeyRef\.current\)/.test(scheduleClient)
    && /if \(currentMonthKeyRef\.current !== monthKey\) return/.test(scheduleClient),
  'Local shift mutations should invalidate their operation month and avoid applying old-month results to a newer visible month.'
);

assert(
  !/useEffect\(\(\) => \{\s*if \(initialDataMatchesMonth[\s\S]*?overviewCacheRef\.current\.set\(initialMonth/.test(scheduleClient),
  'Initial server overview data should not be re-seeded into cache after mutations.'
);

assert(
  /invalidateOverviewCacheForMonth\(/.test(scheduleClient),
  'Schedule mutations should invalidate the current month overview cache.'
);

assert(
  /overviewCacheRef\.current\.clear\(\)/.test(scheduleClient),
  'Employee sort changes should clear all month overview cache entries.'
);

assert(
  /statusRequestIdRef/.test(monthStatusHook)
    && /requestId === statusRequestIdRef\.current/.test(monthStatusHook),
  'useMonthStatus should ignore stale responses when months switch quickly.'
);

assert(
  /closedMonth/.test(batchRoute)
    && /Month is closed for editing/.test(batchRoute),
  'Batch shift API should reject writes against closed months.'
);

console.log('schedule month system contract ok');
