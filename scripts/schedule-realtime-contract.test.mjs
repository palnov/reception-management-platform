import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function read(relativePath) {
  const filePath = resolve(root, relativePath);
  assert.ok(existsSync(filePath), `Expected ${relativePath} to exist`);
  return readFileSync(filePath, 'utf8');
}

const realtimeServer = read('scripts/realtime-server.mjs');
assert.match(realtimeServer, /dotenv\/config/);
assert.match(realtimeServer, /WebSocketServer/);
assert.match(realtimeServer, /REALTIME_PUBLISH_SECRET/);
assert.match(realtimeServer, /schedule\.changed/);
assert.match(realtimeServer, /configured:\s*Boolean\(jwtSecret && publishSecret\)/);
assert.match(realtimeServer, /WebSocket client connected/);
assert.match(realtimeServer, /WebSocket upgrade rejected/);

const publisher = read('lib/realtime-publisher.ts');
assert.match(publisher, /REALTIME_PUBLISH_URL/);
assert.match(publisher, /REALTIME_PUBLISH_SECRET/);
assert.match(publisher, /schedule\.changed/);

const realtimeHook = read('lib/useScheduleRealtime.ts');
assert.match(realtimeHook, /NEXT_PUBLIC_REALTIME_URL/);
assert.match(realtimeHook, /WebSocket/);
assert.match(realtimeHook, /Connecting to realtime URL/);
assert.match(realtimeHook, /visibilitychange/);
assert.match(realtimeHook, /setInterval/);

const scheduleClient = read('app/schedule/ScheduleClient.tsx');
assert.match(scheduleClient, /useScheduleRealtime/);
assert.match(scheduleClient, /syncShiftsInBackground/);
assert.match(scheduleClient, /invalidateOverviewCacheForMonth\(currentMonthKey\)/);

const scheduleApi = read('app/schedule/schedule-api.ts');
assert.match(scheduleApi, /cache:\s*['"]no-store['"]/);

const shiftsRoute = read('app/api/shifts/route.ts');
assert.match(shiftsRoute, /publishScheduleChange/);
assert.match(shiftsRoute, /findFirst\(\{\s*where:\s*\{\s*employeeId,\s*date\s*\}/s);
assert.match(shiftsRoute, /where:\s*\{\s*id:\s*existing\.id\s*\}/s);

const batchRoute = read('app/api/shifts/batch/route.ts');
assert.match(batchRoute, /publishScheduleChange/);
assert.match(batchRoute, /auditLog\.create/);
assert.match(
  batchRoute,
  /existingShifts\.find\(\(shift\)\s*=>\s*shift\.id\s*===\s*op\.id\)[\s\S]*existingMap\.get/
);

const infoTooltip = read('components/InfoTooltip.tsx');
assert.match(infoTooltip, /lastLog\.changedBy/);
assert.match(infoTooltip, /currentUser\.role\s*===\s*['"]MANAGER['"]/);
assert.match(infoTooltip, /isOwnShift/);
assert.match(infoTooltip, /lastLog\.changedBy\s*===\s*currentUser\.name/);
assert.doesNotMatch(infoTooltip, /supersededLog|latestEditor === myName/);

const normsRoute = read('app/api/norms/route.ts');
assert.match(normsRoute, /publishScheduleChange/);

const monthStatusRoute = read('app/api/months/status/route.ts');
assert.match(monthStatusRoute, /publishScheduleChange/);

console.log('Schedule realtime contract checks passed.');
