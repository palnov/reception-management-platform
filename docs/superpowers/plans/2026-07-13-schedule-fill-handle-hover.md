# Schedule Fill Handle Hover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the schedule fill handle above neighbouring cells so its crosshair cursor does not flicker while retaining its current size and position.

**Architecture:** Replace the per-cell overlapping pointer targets with one absolutely positioned overlay target owned by `ScheduleGrid`. The grid will identify a cell under the pointer, position the overlay at its lower-right corner, and keep that overlay active while the pointer is inside it. This preserves the existing `ScheduleClient` fill-start callback and selection state.

**Tech Stack:** React 19, TypeScript, Next.js, Tailwind CSS, Node assertion scripts.

---

## File structure

- `app/schedule/ScheduleGrid.tsx` — owns grid cell discovery, overlay positioning, and the interactive fill-handle layer.
- `scripts/schedule-fill-handle-hover.test.mjs` — protects the DOM/CSS contract that prevents a cell-level pointer target from overlapping neighbour cells.

### Task 1: Add a regression contract

**Files:**

- Create: `scripts/schedule-fill-handle-hover.test.mjs`
- Test: `scripts/schedule-fill-handle-hover.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app/schedule/ScheduleGrid.tsx', import.meta.url), 'utf8');

assert.match(source, /data-fill-handle-overlay/, 'ScheduleGrid should render one overlay fill handle.');
assert.match(source, /pointer-events-none/, 'The overlay wrapper should ignore pointers outside the handle.');
assert.match(source, /pointer-events-auto cursor-crosshair/, 'Only the fill handle should receive pointer events.');
assert.doesNotMatch(source, /<td[\\s\\S]*?cursor-crosshair/, 'Grid cells must not contain the overlapping crosshair target.');

console.log('schedule fill handle hover contract ok');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/schedule-fill-handle-hover.test.mjs`

Expected: failure because `ScheduleGrid` has no dedicated overlay fill-handle element.

### Task 2: Move the pointer target into an overlay layer

**Files:**

- Modify: `app/schedule/ScheduleGrid.tsx:39-91`
- Modify: `app/schedule/ScheduleGrid.tsx:250-278`
- Modify: `app/schedule/ScheduleGrid.tsx:403-469`
- Test: `scripts/schedule-fill-handle-hover.test.mjs`

- [ ] **Step 1: Add a single overlay component**

Create a memoized component that owns one `div` with `data-fill-handle-overlay`. It accepts the active cell coordinates, uses the grid container and table body references to find that cell, and positions the handle at `cellRect.right - containerRect.left + scrollLeft - 5` and `cellRect.bottom - containerRect.top + scrollTop - 5`.

```tsx
<div className="pointer-events-none absolute inset-0 z-[80]">
  <div
    data-fill-handle-overlay
    className="pointer-events-auto absolute h-2.5 w-2.5 cursor-crosshair"
    onMouseEnter={() => onHandleHover(activeCell.empId, activeCell.dateKey)}
    onMouseLeave={() => onHandleHover(null, null)}
    onMouseDown={onHandleMouseDown}
  />
</div>
```

Hide the handle when there is no active cell, the grid is closed, or the user cannot edit it. Recalculate its position when the active cell changes and after container scrolls.

- [ ] **Step 2: Replace overlapping cell handles with hover detection**

Remove the `absolute -bottom-[5px] -right-[5px] ... cursor-crosshair` element from every schedule cell. Add `onMouseMove` to the `td`: compare `clientX` and `clientY` with its bounding rectangle and call `onHandleHover(emp.id, dateKey)` only when the pointer is inside the final 10 px at the lower-right; otherwise call `onHandleHover(null, null)`. Keep all existing cell selection and context-menu behavior unchanged.

- [ ] **Step 3: Run the regression test to verify it passes**

Run: `node scripts/schedule-fill-handle-hover.test.mjs`

Expected: `schedule fill handle hover contract ok` and exit code 0.

- [ ] **Step 4: Commit the implementation**

```powershell
git add app/schedule/ScheduleGrid.tsx scripts/schedule-fill-handle-hover.test.mjs
git commit -m "fix: stabilize schedule fill handle cursor"
```

### Task 3: Verify the change

**Files:**

- Test: `scripts/schedule-fill-handle-hover.test.mjs`

- [ ] **Step 1: Run focused regression coverage**

Run: `node scripts/schedule-fill-handle-hover.test.mjs`

Expected: exit code 0 and `schedule fill handle hover contract ok`.

- [ ] **Step 2: Run static verification**

Run: `npm run lint; npm run typecheck`

Expected: both commands exit with code 0.

- [ ] **Step 3: Manually verify in the browser**

Open the schedule, hover a cell's lower-right 10 px, and move repeatedly around the part of the handle that overlaps adjacent cells. The cursor stays `crosshair` while over the square, returns to the regular pointer once outside it, and dragging from the square still fills the intended range.
