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

const publisher = read('lib/realtime-publisher.ts');
assert.match(publisher, /REALTIME_PUBLISH_URL/);
assert.match(publisher, /REALTIME_PUBLISH_SECRET/);
assert.match(publisher, /schedule\.changed/);

const realtimeHook = read('lib/useScheduleRealtime.ts');
assert.match(realtimeHook, /NEXT_PUBLIC_REALTIME_URL/);
assert.match(realtimeHook, /WebSocket/);
assert.match(realtimeHook, /visibilitychange/);
assert.match(realtimeHook, /setInterval/);

const scheduleClient = read('app/schedule/ScheduleClient.tsx');
assert.match(scheduleClient, /useScheduleRealtime/);
assert.match(scheduleClient, /syncShiftsInBackground/);

const shiftsRoute = read('app/api/shifts/route.ts');
assert.match(shiftsRoute, /publishScheduleChange/);
assert.match(shiftsRoute, /findFirst\(\{\s*where:\s*\{\s*employeeId,\s*date\s*\}/s);
assert.match(shiftsRoute, /where:\s*\{\s*id:\s*existing\.id\s*\}/s);

const batchRoute = read('app/api/shifts/batch/route.ts');
assert.match(batchRoute, /publishScheduleChange/);
assert.match(
  batchRoute,
  /existingShifts\.find\(\(shift\)\s*=>\s*shift\.id\s*===\s*op\.id\)[\s\S]*existingMap\.get/
);

console.log('Schedule realtime contract checks passed.');
