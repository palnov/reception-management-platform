import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import Module from 'node:module';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';

function compileTsModule(module, filename) {
  const source = readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;

  module._compile(output, filename);
}

const require = Module.createRequire(import.meta.url);
require.extensions['.ts'] = compileTsModule;

function loadTsModule(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing module: ${filePath}`);
  }

  const mod = new Module(filePath);
  mod.filename = filePath;
  mod.paths = Module._nodeModulePaths(dirname(filePath));
  compileTsModule(mod, filePath);
  return mod.exports;
}

const { buildDetailizationWorkbook } = loadTsModule(resolve('lib/report-detailization.ts'));
const detailizationSource = readFileSync(resolve('lib/report-detailization.ts'), 'utf8');

assert.match(
  detailizationSource,
  /const accruedTotalFormula:\s*ExcelJS\.CellFormulaValue[\s\S]*date1904:\s*false/,
  'The total formula must use an explicit ExcelJS formula value type with date1904',
);

const expectedMerges = [
  'A1:K1',
  'A2:D2',
  'E2:S2',
  'A3:G4',
  'H3:J4',
  'K3:L4',
  'M3:S4',
  'A5:G5',
  'H5:J5',
  'K5:L5',
  'A6:G6',
  'H6:J6',
  'K6:L6',
  'A7:G7',
  'H7:J7',
  'K7:L7',
  'A8:G8',
  'H8:J8',
  'K8:L8',
  'A9:G9',
  'H9:J9',
  'K9:L9',
  'A10:G10',
  'H10:J10',
  'K10:L10',
  'A11:G11',
  'H11:J11',
  'K11:L11',
  'A12:G12',
  'H12:J12',
  'K12:L12',
  'A13:G13',
  'H13:J13',
  'K13:L13',
  'A14:G14',
  'H14:J14',
  'K14:L14',
  'A15:G15',
  'H15:J15',
  'K15:L15',
  'A16:G16',
  'H16:J16',
  'K16:L16',
  'M16:S16',
  'K18:L18',
  'K19:L19',
];

const workbook = await buildDetailizationWorkbook({
  employeeName: 'Иванов Иван Иванович',
  reportDate: new Date('2026-01-01T00:00:00.000Z'),
  intensityDays: 14,
  intensityBonus: 7700,
  checklistPercent: 95,
  checklistBonus: 5000,
  cardQualityPercent: 95,
  cardQualityBonus: 5000,
  salesTotal: 29280,
  salesBonus: 2049.6,
  closingDays: 7,
  closingBonus: 1750,
  archiveHours: 11,
  archiveBonus: 3500,
  sickLeaveOpening: 3,
  sickLeaveClosing: 7,
  sickLeaveBonus: 950,
  additionalEntryCount: 3,
  additionalEntryBonus: 150,
  traineeDays: 2,
  traineeBonus: 1000,
  cardCreationCount: 4,
  cardCreationBonus: 240,
  seniorityPercent: 3,
  seniorityBonus: 1008,
});

assert.deepEqual(
  workbook.worksheets.map((worksheet) => worksheet.name),
  ['Лист1', 'Лист2', 'Лист3'],
  'Workbook must preserve the template worksheet tabs',
);

const worksheet = workbook.getWorksheet('Лист1');
assert.ok(worksheet, 'Workbook must contain the populated Лист1 worksheet');

assert.equal(worksheet.getCell('A1').value, 'ДЕТАЛИЗАЦИЯ ДОПЛАТЫ ЗА ВЫПОЛНЕНИЕ KPI');
assert.equal(worksheet.getCell('E2').value, 'Иванов Иван Иванович');
assert.equal(worksheet.getCell('A3').value, 'Вид');
assert.equal(worksheet.getCell('H3').value, 'Расчетная база');
assert.equal(worksheet.getCell('K3').value, 'Начислено (руб.)');

assert.deepEqual(
  [...worksheet.model.merges].sort(),
  [...expectedMerges].sort(),
  'Generated workbook must preserve template merge ranges',
);

assert.equal(worksheet.getColumn(4).width, 6);
assert.equal(worksheet.getColumn(5).width, 9.140625);
assert.equal(worksheet.getColumn(5).hidden, true);
assert.equal(worksheet.getColumn(9).width, 8.140625);
assert.equal(worksheet.getColumn(10).hidden, true);
assert.equal(worksheet.getColumn(12).width, 9);
assert.equal(worksheet.getColumn(13).hidden, true);
assert.equal(worksheet.properties.defaultRowHeight, 15);

assert.equal(worksheet.getCell('H5').value, '14 дней');
assert.equal(worksheet.getCell('K5').value, 7700);
assert.equal(worksheet.getCell('H6').value, 'Выполение 95% ');
assert.equal(worksheet.getCell('K6').value, 5000);
assert.equal(worksheet.getCell('H7').value, 'Выполнение 95%');
assert.equal(worksheet.getCell('K7').value, 5000);
assert.equal(worksheet.getCell('H8').value, 29280);
assert.equal(worksheet.getCell('K8').value, 2049.6);
assert.equal(worksheet.getCell('H11').value, '3 открытия, 7 закрытий');
assert.equal(worksheet.getCell('A12').value, 'Дозапись');
assert.equal(worksheet.getCell('H12').value, '3 шт.');
assert.equal(worksheet.getCell('K12').value, 150);
assert.equal(
  worksheet.getCell('A10').value,
  'Выполнение доп.обязанностей в пределах рабочего времени в указанном объёме, ч.',
);
assert.deepEqual(worksheet.getCell('H16').value, new Date('2026-01-01T00:00:00.000Z'));
assert.deepEqual(worksheet.getCell('K16').value, { formula: 'SUM(K5:L15)', result: 28347.6 });
assert.equal(worksheet.getCell('K16').numFmt, '#,##0.00');
assert.equal(worksheet.getCell('A18').value, 'Утверждено (руководитель службы заботы)');
assert.equal(worksheet.getCell('A19').value, 'Сотрудник');

console.log('Detailization template layout checks passed');
