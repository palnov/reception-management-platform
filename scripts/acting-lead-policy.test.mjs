import assert from 'node:assert/strict';
import { shouldIncludeActingLeadBonus } from '../lib/acting-lead-policy.ts';

assert.equal(
  shouldIncludeActingLeadBonus(new Date(2026, 2, 1)),
  true,
  'March 2026 should still include the legacy acting lead metric',
);

assert.equal(
  shouldIncludeActingLeadBonus(new Date(2026, 3, 1)),
  false,
  'April 2026 should not include the retired acting lead metric',
);

assert.equal(
  shouldIncludeActingLeadBonus('2026-03-31'),
  true,
  'dates before the retirement date should include the metric',
);

assert.equal(
  shouldIncludeActingLeadBonus('2026-04-01'),
  false,
  'the retirement date itself should not include the metric',
);

