import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const schema = read('prisma/schema.prisma');
const employeesPage = read('app/employees/page.tsx');
const employeeApi = read('app/api/employees/route.ts');
const shiftApi = read('app/api/shifts/route.ts');
const batchShiftApi = read('app/api/shifts/batch/route.ts');
const scheduleTypes = read('app/schedule/schedule-types.ts');
const scheduleClient = read('app/schedule/ScheduleClient.tsx');
const shiftModal = read('app/schedule/ScheduleShiftModal.tsx');
const batchModal = read('app/schedule/ScheduleBatchModal.tsx');

assert.match(schema, /maxCoefficient\s+Float\s+@default\(1\.5\)/, 'Employee must persist maxCoefficient with 1.5 default');
assert.match(employeesPage, /HOSPITALIZATION_MANAGER/, 'Employees form must include hospitalization manager role');
assert.match(employeesPage, /Максимальный коэффициент/, 'Employees form must show max coefficient field');
assert.match(employeesPage, /step="0\.1"/, 'Max coefficient input must use 0.1 step');
assert.match(employeeApi, /maxCoefficient/, 'Employees API must read and write maxCoefficient');
assert.match(scheduleTypes, /maxCoefficient\?: number/, 'Schedule employee type must include maxCoefficient');
assert.match(scheduleClient, /getEmployeeShiftCoefficientLimit/, 'Schedule must derive coefficient max from selected employee');
assert.match(shiftModal, /coefficientMax/, 'Single shift modal must receive employee coefficient max');
assert.match(batchModal, /coefficientMax/, 'Batch shift modal must receive selected employee coefficient max');
assert.match(shiftApi, /clampShiftCoefficient/, 'Single shift API must clamp coefficient with employee-specific limit');
assert.match(batchShiftApi, /clampShiftCoefficient/, 'Batch shift API must clamp coefficient with employee-specific limit');

assert.doesNotMatch(shiftApi, /Math\.min\([^;\n]+,\s*1\.5\)/, 'Single shift API must not hard-code 1.5 coefficient cap');
assert.doesNotMatch(batchShiftApi, /Math\.min\([^;\n]+,\s*1\.5\)/, 'Batch shift API must not hard-code 1.5 coefficient cap');
assert.doesNotMatch(scheduleClient, /Math\.min\([^;\n]+,\s*1\.5\)/, 'Schedule client must not hard-code 1.5 coefficient cap');
assert.doesNotMatch(shiftModal, /max="1\.5"/, 'Single shift modal must not hard-code 1.5 max');
assert.doesNotMatch(batchModal, /max="1\.5"/, 'Batch shift modal must not hard-code 1.5 max');

console.log('employee max coefficient checks passed');
