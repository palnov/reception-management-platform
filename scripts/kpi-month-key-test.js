const fs = require('fs');
const assert = require('assert/strict');
const path = require('path');

const kpiClientPath = path.join(process.cwd(), 'app', 'kpi', 'KpiClient.tsx');
const source = fs.readFileSync(kpiClientPath, 'utf8');

function readFilesRecursive(directory, extensions) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return readFilesRecursive(fullPath, extensions);
    return extensions.includes(path.extname(entry.name)) ? [fullPath] : [];
  });
}

const saratovStartOfMay = new Date('2026-05-01T00:00:00+04:00');
assert.equal(
  saratovStartOfMay.toISOString().substring(0, 7),
  '2026-04',
  'UTC ISO month demonstrates the Saratov month-boundary regression'
);

assert.equal(
  source.includes('currentMonth.toISOString().substring(0, 7)'),
  false,
  'KPI manual checklist values must use a local calendar month key, not a UTC ISO month'
);

const staleInitialDataSkips = readFilesRecursive(path.join(process.cwd(), 'app'), ['.tsx', '.ts'])
  .filter((filePath) => fs
    .readFileSync(filePath, 'utf8')
    .includes('initialDataMatchesMonth && !initialDataConsumedRef.current'));

assert.deepEqual(
  staleInitialDataSkips,
  [],
  'Month changes must not skip loading just because the selected month later matches initialData'
);

assert.equal(
  source.includes('await fetchData();'),
  false,
  'Saving KPI manual checklist values must update local state instead of reloading the whole table'
);

console.log('KPI month-key regression checks passed');
