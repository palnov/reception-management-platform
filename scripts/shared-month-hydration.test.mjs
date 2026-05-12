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

const sharedMonthSource = read('lib/useSharedMonth.ts');
const kpiClientSource = read('app/kpi/KpiClient.tsx');
const scheduleClientSource = read('app/schedule/ScheduleClient.tsx');

assert(
  /export function useSharedMonth\(initialMonth\?: string\)/.test(sharedMonthSource),
  'useSharedMonth should accept the server-rendered initialMonth as its hydration seed.'
);

assert(
  !/useState<Date>\(\(\) => startOfMonth\(getStoredMonth\(\)\)\)/.test(sharedMonthSource),
  'useSharedMonth must not read localStorage in the useState initializer.'
);

assert(
  /useSharedMonth\(initialMonth\)/.test(kpiClientSource),
  'KPI page should seed useSharedMonth with the server initialMonth.'
);

assert(
  /useSharedMonth\(initialMonth\)/.test(scheduleClientSource),
  'Schedule page should seed useSharedMonth with the server initialMonth.'
);

assert(
  !/new StorageEvent\(/.test(sharedMonthSource)
    && /new CustomEvent\(/.test(sharedMonthSource),
  'useSharedMonth should not construct StorageEvent manually because it can throw in some browsers.'
);

console.log('shared month hydration contract ok');
