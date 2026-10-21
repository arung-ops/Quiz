import test from 'node:test';
import assert from 'node:assert/strict';
import { settleRewardsFaulty } from '../src/faulty-rewards.js';
import { SETTLEMENT_AT } from '../src/rewards.js';

test('regression contract: duplicate task IDs produce one payout', () => {
  const task = { id: 'task-duplicate', accountId: 'account-7', status: 'completed', completedAt: '2026-10-14T12:00:00Z' };
  const payouts = settleRewardsFaulty({ tasks: [task, { ...task }], settlementAt: SETTLEMENT_AT });

  assert.equal(payouts.length, 1, 'one unique task ID must create one payout');
  assert.equal(payouts[0].credits, 10);
});