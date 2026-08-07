# Дозапись в KPI и зарплате — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a monthly editable “Дозапись” count to the KPI salary table, calculate 50 ₽ per item, and include the metric in salary and detailization exports.

**Architecture:** Extend the existing `MonthlyChecklist` record instead of creating a new event table. Reuse `/api/checklist` and the current manager/open-month editing path, then feed the new count into both client-side payroll calculations and the server-side report service. Keep the backup/restore paths backward-compatible by defaulting missing values to zero.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma 5 with SQLite, ExcelJS, Node assertion-based regression scripts.

---

## File map

- Modify `prisma/schema.prisma`: add the persisted monthly count.
- Create `prisma/migrations/20260807120000_add_additional_entry_count/migration.sql`: add the SQLite column with a zero default.
- Modify `app/api/checklist/route.ts`: accept, validate, upsert, and return the count.
- Modify `app/api/backup/route.ts` and `scripts/restore-from-local-backup.ts`: preserve the count through both restore paths and treat legacy backups as zero.
- Modify `app/kpi/KpiClient.tsx`: type, calculate, render, and edit the new table column.
- Modify `lib/report-service.ts`: calculate the bonus in salary exports and expose the count in the “Зарплата” worksheet and individual detailization input.
- Modify `lib/report-detailization.ts`: add the separate “Дозапись” line, shift the total/signature rows, and include the new line in the formula.
- Modify `scripts/smoke-check.js`: verify the deployed database contains the new `MonthlyChecklist` column.
- Create `scripts/additional-entry-kpi.test.mjs`: source-level regression checks for the end-to-end contract.
- Modify `scripts/detailization-template-layout.test.mjs`: exercise the new detailization row and shifted template layout.

### Task 1: Establish failing regression coverage

**Files:**
- Create: `scripts/additional-entry-kpi.test.mjs`
- Modify: `scripts/detailization-template-layout.test.mjs`

- [ ] **Step 1: Add the contract test before production changes**

Create a Node assertion script that reads the schema, API, client, backup, restore, report, and detailization sources and asserts the new field/formula/labels are present. The assertions must cover these exact behaviors:

```js
assert.match(schema, /additionalEntryCount\s+Int\s+@default\(0\)/);
assert.match(checklistApi, /additionalEntryCount/);
assert.match(kpiClient, /Дозапись/);
assert.match(kpiClient, /additionalEntryBonus\s*=\s*additionalEntryCount\s*\*\s*50/);
assert.match(kpiClient, /handleSaveChecklist\(calc\.empId, 'additionalEntryCount'/);
assert.match(reportService, /additionalEntryBonus\s*=\s*additionalEntryCount\s*\*\s*50/);
assert.match(reportService, /header:\s*'Дозапись'/);
assert.match(backupRoute, /additionalEntryCount:\s*Number\(m\.additionalEntryCount\s*\?\?\s*0\)/);
assert.match(localRestore, /additionalEntryCount:\s*Number\(m\.additionalEntryCount\s*\?\?\s*0\)/);
assert.match(detailizationSource, /additionalEntryCount/);
```

Also assert the API rejects negative/non-integer values by checking for `Number.isInteger` and a `< 0` guard. End the script with `console.log('Additional entry KPI contract checks passed')`.

Update `scripts/detailization-template-layout.test.mjs`’s fixture with `additionalEntryCount: 3` and `additionalEntryBonus: 150`, add expected merges for row 16 and signature rows 18–19, and assert:

```js
assert.equal(worksheet.getCell('A12').value, 'Дозапись');
assert.equal(worksheet.getCell('H12').value, '3 шт.');
assert.equal(worksheet.getCell('K12').value, 150);
assert.deepEqual(worksheet.getCell('K16').value, { formula: 'SUM(K5:L15)', result: 28347.6 });
assert.equal(worksheet.getCell('A18').value, 'Утверждено (руководитель службы заботы)');
assert.equal(worksheet.getCell('A19').value, 'Сотрудник');
```

- [ ] **Step 2: Run the new tests and confirm RED**

Run:

```powershell
node scripts/additional-entry-kpi.test.mjs
node scripts/detailization-template-layout.test.mjs
```

Expected: both commands fail because the new field, contract strings, and detailization row do not exist yet. Do not change production code until these failures are observed.

### Task 2: Persist and transport the monthly count

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260807120000_add_additional_entry_count/migration.sql`
- Modify: `app/api/checklist/route.ts`
- Modify: `app/api/backup/route.ts`
- Modify: `scripts/restore-from-local-backup.ts`
- Modify: `scripts/smoke-check.js`

- [ ] **Step 1: Add the schema field and migration**

Add this field beside the other integer monthly metrics:

```prisma
additionalEntryCount Int      @default(0)
```

Create the migration with:

```sql
ALTER TABLE "MonthlyChecklist" ADD COLUMN "additionalEntryCount" INTEGER NOT NULL DEFAULT 0;
```

- [ ] **Step 2: Extend the checklist API with validation and upsert data**

Include `additionalEntryCount` in the request destructuring. Parse only this new value with a strict non-negative integer guard:

```ts
const parsedAdditionalEntryCount = additionalEntryCount === undefined
    ? undefined
    : Number(additionalEntryCount);

if (
    additionalEntryCount !== undefined &&
    (!Number.isInteger(parsedAdditionalEntryCount) || parsedAdditionalEntryCount < 0)
) {
    return NextResponse.json({ error: 'Additional entry count must be a non-negative integer' }, { status: 400 });
}
```

Use `parsedAdditionalEntryCount` in both `update` and `create` data objects, preserving `0` as the default when the property is omitted. Leave the existing manager and closed-month checks unchanged.

- [ ] **Step 3: Preserve the field in backups and smoke checks**

Add this mapping to both restore paths’ monthly-checklist `data` objects and to the local restore update object:

```ts
additionalEntryCount: Number(m.additionalEntryCount ?? 0),
```

Add `additionalEntryCount` to `REQUIRED_COLUMNS.MonthlyChecklist` in `scripts/smoke-check.js` (create the array if it is not currently present). Legacy backups without the property must restore as zero.

- [ ] **Step 4: Generate Prisma client and rerun the contract test**

Run:

```powershell
npx prisma generate
node scripts/additional-entry-kpi.test.mjs
```

Expected: Prisma generation succeeds and the contract test still fails only for the not-yet-implemented client/report/detailization assertions.

### Task 3: Add the editable KPI table column and client calculation

**Files:**
- Modify: `app/kpi/KpiClient.tsx`

- [ ] **Step 1: Add the field to the monthly checklist type and payroll calculation**

Add `additionalEntryCount?: number` to `MonthlyChecklist`. In the monthly checklist block, calculate:

```ts
const additionalEntryCount = empChecklist ? (empChecklist.additionalEntryCount || 0) : 0;
const additionalEntryBonus = additionalEntryCount * 50;
```

Add `additionalEntryBonus` to `totalPay` and return both `additionalEntryCount` and `additionalEntryBonus` from the `payrollData` mapper.

- [ ] **Step 2: Add the header, editable cell, and column count**

Place the new header after `Закр/Продл Б/Л` and before `Карточки`:

```tsx
<th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-center whitespace-nowrap min-w-[110px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>
    <Tooltip content="Доплата за дозапись">Дозапись</Tooltip>
</th>
```

Add a cell using the same editing structure as `sickLeaveOpening`, with `field === 'additionalEntryCount'`, `min="0"`, `step="1"`, and display `+{calc.additionalEntryBonus}` plus `{calc.additionalEntryCount || '-'} шт.`. Update `payrollColumnCount` from 15/16 to 16/17.

- [ ] **Step 3: Run the client contract and type checks**

Run:

```powershell
node scripts/additional-entry-kpi.test.mjs
npm run typecheck
```

Expected: the client assertions pass; typecheck may still report report/detailization fixture or implementation errors until Task 4 and Task 5 are complete.

### Task 4: Add the metric to salary report exports

**Files:**
- Modify: `lib/report-service.ts`

- [ ] **Step 1: Calculate and include the bonus**

Beside the existing sick-leave/card values, add:

```ts
const additionalEntryCount = empChecklist ? (empChecklist.additionalEntryCount || 0) : 0;
const additionalEntryBonus = additionalEntryCount * 50;
```

Add `additionalEntryBonus` to the `bonuses` sum and pass `additionalEntryCount` to the salary worksheet row.

- [ ] **Step 2: Add the salary worksheet column**

Insert this column after `Закрытие/продление Б/Л` and before `Карточки`:

```ts
{ header: 'Дозапись', key: 'additional_entry', width: 15, style: centerStyle },
```

Add `additional_entry: additionalEntryCount` to the row object. Keep the column as a count (not rubles), matching the existing sick-leave columns.

- [ ] **Step 3: Pass the count through individual detailization generation**

In `generateDetailizationWorkbook`, read `monthlyChecklist?.additionalEntryCount || 0` and pass `additionalEntryCount` and `additionalEntryBonus` to `buildDetailizationWorkbook`. This bonus must be part of the same total represented in the detailization workbook.

- [ ] **Step 4: Rerun report contract coverage**

Run:

```powershell
node scripts/additional-entry-kpi.test.mjs
```

Expected: salary-report and detailization-input assertions pass; the detailization layout test remains RED until Task 5.

### Task 5: Add the detailization line and update the template layout

**Files:**
- Modify: `lib/report-detailization.ts`
- Modify: `scripts/detailization-template-layout.test.mjs`

- [ ] **Step 1: Extend the workbook data contract**

Add `additionalEntryCount: number` and `additionalEntryBonus: number` to `DetailizationWorkbookData`.

- [ ] **Step 2: Shift the template one row and add the metric**

Insert the new row after the existing `Оформление ЭЛН` row:

```ts
['A12', 'H12', 'K12', 'Дозапись', `${data.additionalEntryCount} ${pluralRu(data.additionalEntryCount, 'штука', 'штуки', 'штук')}`, data.additionalEntryBonus],
```

Move the trainee/card/seniority rows to 13–15, move total to row 16, and move approval/signature rows to 18–19. Update all corresponding merge ranges, border loops, total formula (`SUM(K5:L15)`), and accrued-total arithmetic to include `data.additionalEntryBonus`.

- [ ] **Step 3: Run the detailization test and full focused suite**

Run:

```powershell
node scripts/detailization-template-layout.test.mjs
node scripts/additional-entry-kpi.test.mjs
```

Expected: both pass and the detailization workbook reports `3 шт.`, `150`, and the shifted total formula/result.

### Task 6: Verify the complete change

**Files:**
- No new files; verify all files above.

- [ ] **Step 1: Run focused and existing regression tests**

Run:

```powershell
node scripts/additional-entry-kpi.test.mjs
node scripts/detailization-template-layout.test.mjs
node scripts/kpi-checklist-manual-mode-test.js
npm run test:employee-coefficient
npm run smoke
```

Expected: every command exits with code 0 and prints its success message. If `npm run smoke` uses a database that has not applied the migration, apply the new Prisma migration first and rerun it.

- [ ] **Step 2: Run lint, typecheck, and production build**

Run:

```powershell
npm run lint
npm run typecheck
npm run build
```

Expected: all commands exit with code 0. The build must regenerate Prisma and compile the Next.js application without missing `additionalEntryCount` properties.

- [ ] **Step 3: Inspect the final diff and commit implementation**

Run:

```powershell
git diff --check
git status --short
git diff --stat
git add prisma app lib scripts
git commit -m "feat: add additional entry KPI metric"
```

Expected: `git diff --check` reports no whitespace errors, the diff contains only the documented files, and the commit succeeds on `codex/additional-entry-kpi`.
