import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = readFileSync(resolve(root, 'app/schedule/ScheduleClient.tsx'), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const autoFillMatch = source.match(/const handleAutoFill = async \(\) => \{[\s\S]*?\n    \};/);

assert(autoFillMatch, 'ScheduleClient should define handleAutoFill.');

const autoFillSource = autoFillMatch[0];

assert(
  /mergeLocalShifts\(/.test(autoFillSource) || /overviewCacheRef\.current\.delete/.test(autoFillSource),
  'handleAutoFill should update local shifts or invalidate overview cache after a successful batch save.'
);

assert(
  /await fetchShifts\(\)|syncShiftsInBackground\(\)/.test(autoFillSource),
  'handleAutoFill should refresh shifts after a successful batch save.'
);

console.log('schedule autofill cache contract ok');
