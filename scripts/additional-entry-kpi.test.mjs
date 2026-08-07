import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function read(relativePath) {
  return readFileSync(resolve(relativePath), 'utf8');
}

const schema = read('prisma/schema.prisma');
const migrationPath = resolve('prisma/migrations/20260807120000_add_additional_entry_count/migration.sql');
const checklistApi = read('app/api/checklist/route.ts');
const kpiClient = read('app/kpi/KpiClient.tsx');
const backupRoute = read('app/api/backup/route.ts');
const localRestore = read('scripts/restore-from-local-backup.ts');
const reportService = read('lib/report-service.ts');
const detailizationSource = read('lib/report-detailization.ts');
const smokeCheck = read('scripts/smoke-check.js');

assert.match(schema, /additionalEntryCount\s+Int\s+@default\(0\)/);
assert.ok(existsSync(migrationPath), 'Additional entry migration must exist');
assert.match(
  readFileSync(migrationPath, 'utf8'),
  /ADD COLUMN "additionalEntryCount" INTEGER NOT NULL DEFAULT 0/
);

assert.match(checklistApi, /additionalEntryCount/);
assert.match(checklistApi, /Number\.isInteger\(parsedAdditionalEntryCount\)/);
assert.match(checklistApi, /parsedAdditionalEntryCount\s*<\s*0/);

assert.match(kpiClient, /Дозапись/);
assert.match(kpiClient, /additionalEntryBonus\s*=\s*additionalEntryCount\s*\*\s*50/);
assert.match(kpiClient, /handleSaveChecklist\(calc\.empId, 'additionalEntryCount'/);
assert.match(kpiClient, /payrollColumnCount\s*=\s*includeActingLeadBonus\s*\?\s*17\s*:\s*16/);

assert.match(backupRoute, /additionalEntryCount:\s*Number\(m\.additionalEntryCount\s*\?\?\s*0\)/);
assert.match(localRestore, /additionalEntryCount:\s*Number\(m\.additionalEntryCount\s*\?\?\s*0\)/);

assert.match(reportService, /additionalEntryBonus\s*=\s*additionalEntryCount\s*\*\s*50/);
assert.match(reportService, /header:\s*'Дозапись'/);
assert.match(reportService, /additional_entry:\s*additionalEntryCount/);

assert.match(detailizationSource, /additionalEntryCount/);
assert.match(detailizationSource, /additionalEntryBonus/);
assert.match(smokeCheck, /MonthlyChecklist:\s*\['additionalEntryCount'\]/);

console.log('Additional entry KPI contract checks passed');
