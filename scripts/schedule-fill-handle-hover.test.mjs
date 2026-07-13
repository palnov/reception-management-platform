import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app/schedule/ScheduleGrid.tsx', import.meta.url), 'utf8');

assert.match(source, /data-fill-handle-overlay/, 'ScheduleGrid should render one overlay fill handle.');
assert.match(source, /pointer-events-none/, 'The overlay wrapper should ignore pointers outside the handle.');
assert.match(source, /data-fill-handle-overlay[\s\S]*?cursor-crosshair[\s\S]*?pointer-events-auto/, 'Only the fill handle should receive pointer events.');
assert.doesNotMatch(source, /onMouseEnter=\{\(\) => onHandleHover\(emp\.id, dateKey\)\}/, 'Grid cells must not contain the overlapping crosshair target.');

console.log('schedule fill handle hover contract ok');
