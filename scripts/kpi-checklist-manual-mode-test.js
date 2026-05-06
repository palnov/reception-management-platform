const fs = require('fs');
const assert = require('assert/strict');
const path = require('path');

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const kpiClient = read('app/kpi/KpiClient.tsx');
const reportService = read('lib/report-service.ts');
const checklistApi = read('app/api/checklist/route.ts');
const navbar = read('components/Navbar.tsx');

assert.match(
  kpiClient,
  /const calcChecklist = empDailyChecklists\.length > 0\s*\?\s*avgDailyChecklist\s*:\s*ownChecklist;/,
  'KPI UI must calculate checklist from daily records when present, otherwise from the manual monthly value'
);

assert.match(
  reportService,
  /const calcChecklist = empDailyChecklists\.length > 0\s*\?\s*avgDailyChecklist\s*:\s*ownChecklist;/,
  'Salary export must use the same daily-if-present-else-manual checklist calculation as the KPI UI'
);

assert.match(
  reportService,
  /const avgChecklist = dailyChecklists\.length > 0\s*\?\s*avgDailyChecklist\s*:\s*manualChecklist;/,
  'Individual payslip must fall back to the manual monthly checklist when no daily checklist records exist'
);

assert.match(
  checklistApi,
  /const auth = await requireManager\(\);[\s\S]*if \(auth\.response\) return auth\.response;/,
  'Manual monthly checklist writes must require the MANAGER role'
);

assert.equal(
  navbar.includes('href="/checklist"'),
  false,
  'Checklist page must be hidden from the application navigation'
);

assert.equal(
  kpiClient.includes('href="/checklist"'),
  false,
  'KPI modal must not direct users to the hidden daily checklist page'
);

console.log('KPI checklist manual-mode regression checks passed');
