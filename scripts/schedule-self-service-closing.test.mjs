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

const scheduleClient = read('app/schedule/ScheduleClient.tsx');
const shiftModal = read('app/schedule/ScheduleShiftModal.tsx');
const batchModal = read('app/schedule/ScheduleBatchModal.tsx');
const shiftRoute = read('app/api/shifts/route.ts');
const batchRoute = read('app/api/shifts/batch/route.ts');

assert(
  /canEditEmployeeShift/.test(scheduleClient)
    && /employee\.seniorId === userData\.id/.test(scheduleClient)
    && /canSaveSelectedShift/.test(scheduleClient)
    && /isOwnExistingShift/.test(scheduleClient),
  'Schedule UI should limit edit targets by role: manager all, senior self/subordinates, admin own existing shift.'
);

assert(
  /canEditClosingFields/.test(shiftModal)
    && /canChangeTraineeField/.test(shiftModal)
    && /canChangeCoefficientField/.test(shiftModal),
  'Shift modal should separate admin self-service fields from protected shift fields.'
);

assert(
  /canAssignArchiveWork \|\| type\.id !== 'ARCHIVE_WORK'/.test(shiftModal)
    && /type\.id !== 'ARCHIVE_WORK'/.test(batchModal),
  'Senior UI should block choosing archive work in single and batch shift editors.'
);

assert(
  /ADMIN/.test(shiftRoute)
    && /existing\.employeeId !== session\.employee\.id/.test(shiftRoute)
    && /type = existing\.type/.test(shiftRoute)
    && /hours = existing\.hours/.test(shiftRoute),
  'Shift API should restrict ADMIN self-service edits to own existing shifts while preserving type and hours.'
);

assert(
  /employeeId !== existing\.employeeId/.test(shiftRoute)
    && /date !== existing\.date/.test(shiftRoute),
  'Shift API should prevent ADMIN self-service updates from moving a shift to another employee or date.'
);

assert(
  /canEditShiftForSession/.test(shiftRoute)
    && /seniorId: true/.test(shiftRoute)
    && /Cannot assign archive work/.test(shiftRoute),
  'Shift API should enforce senior self/subordinate scope and block assigning archive work.'
);

assert(
  /canEditShiftForSession/.test(batchRoute)
    && /seniorId: true/.test(batchRoute)
    && /Cannot assign archive work/.test(batchRoute),
  'Batch shift API should enforce the same senior scope and archive-work restriction.'
);

console.log('schedule self-service closing contract ok');
