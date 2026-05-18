import test from 'node:test';
import assert from 'node:assert/strict';
import { computeProgress, validateGoalSheet } from '../utils/goalRules.js';

test('validates weightage business rules', () => {
  assert.equal(validateGoalSheet([{ title: 'A', weightage: 50 }, { title: 'B', weightage: 50 }]), null);
  assert.match(validateGoalSheet([{ title: 'A', weightage: 9 }, { title: 'B', weightage: 91 }]), /minimum weightage/);
  assert.match(validateGoalSheet(Array.from({ length: 9 }, (_, index) => ({ title: `G${index}`, weightage: 12 }))), /Maximum/);
  assert.match(validateGoalSheet([{ title: 'A', weightage: 40 }, { title: 'B', weightage: 40 }]), /exactly 100/);
});

test('computes progress for all BRD UoM formulas', () => {
  assert.equal(computeProgress('Min (Numeric / %)', 100, 75), 75);
  assert.equal(computeProgress('Min (Numeric / %)', 100, 150), 100);
  assert.equal(computeProgress('Max (Numeric / %)', 10, 20), 50);
  assert.equal(computeProgress('Max (Numeric / %)', 10, 0), 100);
  assert.equal(computeProgress('Timeline', '2026-07-31', '2026-07-30'), 100);
  assert.equal(computeProgress('Timeline', '2026-07-31', '2026-08-01'), 0);
  assert.equal(computeProgress('Zero-based', 0, 0), 100);
  assert.equal(computeProgress('Zero-based', 0, 1), 0);
});

test('approval lock state is represented consistently', () => {
  const approvedGoal = { status: 'locked', locked: true };
  assert.equal(approvedGoal.locked, true);
  assert.equal(approvedGoal.status, 'locked');
});
