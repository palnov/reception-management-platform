# Archive Work Report Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ] syntax) for tracking.

**Goal:** Replace the displayed ARCHIVE_WORK label in both Excel report formats with the exact text "Выполнение доп.обязанностей в пределах рабочего времени в указанном объёме, ч.", while preserving calculations, stored shift types, and historical-period data.

**Architecture:** Add one shared report-label constant in lib/report-labels.ts. Use that constant in the salary-slip generator in lib/report-service.ts and the detailization generator in lib/report-detailization.ts. Reports are generated from stored shifts at download time, so no database migration is needed for past periods.

**Tech Stack:** TypeScript, Next.js, ExcelJS, Node.js assertion-based scripts.

---

## File map

- Create: lib/report-labels.ts — the single exported label used only by report generators.
- Modify: lib/report-service.ts:944 — use the shared label in the salary-slip accrual row.
- Modify: lib/report-detailization.ts:300 — use the shared label in the detailization row.
- Modify: scripts/detailization-template-layout.test.mjs — assert the generated detailization cell contains the new label.
- Create: scripts/report-archive-work-label.test.mjs — assert the salary-slip generator is wired to the shared label and the report sources contain the exact text.

### Task 1: Add failing regression checks

**Files:**
- Modify: scripts/detailization-template-layout.test.mjs
- Create: scripts/report-archive-work-label.test.mjs

- [ ] **Step 1: Add the expected detailization label assertion**

Because this standalone test is run by native Node while the application resolves extensionless TypeScript imports through Next.js, first load report-detailization.ts with the existing project pattern: register a require.extensions['.ts'] transpiler using typescript.transpileModule, create a Module with its filename and node module paths, and obtain buildDetailizationWorkbook from that module. Keep the production import extensionless. Then add this assertion after the existing H11 assertion:

~~~
assert.equal(
  worksheet.getCell('A10').value,
  'Выполнение доп.обязанностей в пределах рабочего времени в указанном объёме, ч.',
);
~~~

- [ ] **Step 2: Add the salary-slip wiring test**

Create scripts/report-archive-work-label.test.mjs with this complete content:

~~~
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const expectedLabel = 'Выполнение доп.обязанностей в пределах рабочего времени в указанном объёме, ч.';
const reportServicePath = resolve('lib/report-service.ts');
const labelsPath = resolve('lib/report-labels.ts');
const reportServiceSource = readFileSync(reportServicePath, 'utf8');
const labelsSource = existsSync(labelsPath) ? readFileSync(labelsPath, 'utf8') : '';

assert.match(
  labelsSource,
  new RegExp(expectedLabel.replace(/[.*+?^$()|[\]\\]/g, '\\$&')),
  'The shared report-label module must contain the exact requested text',
);
assert.match(
  reportServiceSource,
  /import\s+\{\s*ARCHIVE_WORK_REPORT_LABEL\s*\}\s+from\s+'\.\/report-labels';/,
  'The salary-slip generator must import the shared archive-work report label',
);
assert.match(
  reportServiceSource,
  /addSec1Row\(16,\s*ARCHIVE_WORK_REPORT_LABEL,/,
  'The salary-slip archive-work row must use the shared report label',
);
assert.doesNotMatch(
  reportServiceSource,
  /['"]Работа в архиве['"]\s*,/,
  'The salary-slip generator must not emit the old report label',
);

console.log('Archive-work report label checks passed');
~~~

- [ ] **Step 3: Run the new regression checks and confirm RED**

Run:

~~~
node scripts/detailization-template-layout.test.mjs
node scripts/report-archive-work-label.test.mjs
~~~

Expected: the first command fails because cell A10 still contains Работа в архиве; the second command fails because lib/report-labels.ts and the shared-label wiring do not exist yet. Do not change production code before observing these failures.

## Task 2: Add the shared label and wire both report generators

**Files:**
- Create: lib/report-labels.ts
- Modify: lib/report-service.ts:8,944
- Modify: lib/report-detailization.ts:1,300

- [ ] **Step 1: Create the single source of truth**

Create lib/report-labels.ts with exactly:

~~~
export const ARCHIVE_WORK_REPORT_LABEL = 'Выполнение доп.обязанностей в пределах рабочего времени в указанном объёме, ч.';
~~~

- [ ] **Step 2: Import the constant in both generators**

Add this relative import near the existing imports in both lib/report-service.ts and lib/report-detailization.ts:

~~~
import { ARCHIVE_WORK_REPORT_LABEL } from './report-labels';
~~~

- [ ] **Step 3: Replace only the report labels**

In lib/report-service.ts, replace:

~~~
addSec1Row(16, 'Работа в архиве', `${archiveHours} часов`, Math.round(archiveBonus));
~~~

with:

~~~
addSec1Row(16, ARCHIVE_WORK_REPORT_LABEL, `${archiveHours} часов`, Math.round(archiveBonus));
~~~

In lib/report-detailization.ts, replace the fourth item in the row definition:

~~~
['A10', 'H10', 'K10', 'Работа в архиве', `${data.archiveHours} ${pluralRu(data.archiveHours, 'час', 'часа', 'часов')}`, data.archiveBonus],
~~~

with:

~~~
['A10', 'H10', 'K10', ARCHIVE_WORK_REPORT_LABEL, `${data.archiveHours} ${pluralRu(data.archiveHours, 'час', 'часа', 'часов')}`, data.archiveBonus],
~~~

Do not change ARCHIVE_WORK, archiveHours, archiveBonus, or any historical data access.

## Task 3: Verify the green TDD cycle

**Files:**
- Test: scripts/detailization-template-layout.test.mjs
- Test: scripts/report-archive-work-label.test.mjs

- [ ] **Step 1: Run the focused regression checks**

Run:

~~~
node scripts/detailization-template-layout.test.mjs
node scripts/report-archive-work-label.test.mjs
~~~

Expected: both commands exit with code 0 and print their success messages. The detailization test must confirm the generated Лист1!A10 value; the source contract must confirm the salary-slip row uses the shared constant.

- [ ] **Step 2: Inspect the diff for scope**

Run:

~~~
git diff --check
git diff -- lib/report-labels.ts lib/report-service.ts lib/report-detailization.ts scripts/detailization-template-layout.test.mjs scripts/report-archive-work-label.test.mjs
~~~

Expected: no whitespace errors; the diff contains only the shared label, the two report call sites, and their focused regression checks. The schedule UI strings remain unchanged.

- [ ] **Step 3: Run project validation**

Run:

~~~
npm run lint
npm run typecheck
~~~

Expected: both commands exit with code 0 without errors.

- [ ] **Step 4: Commit the implementation**

Run:

~~~
git add lib/report-labels.ts lib/report-service.ts lib/report-detailization.ts scripts/detailization-template-layout.test.mjs scripts/report-archive-work-label.test.mjs
git commit -m "fix: update archive work label in reports"
~~~

Expected: Git creates one implementation commit containing only the report-label change and its regression checks.
