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
