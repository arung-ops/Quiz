import test from 'node:test';
import assert from 'node:assert/strict';
import { getSettlementWindow, SETTLEMENT_AT, settleRewards } from '../src/rewards.js';

const inside = (id, completedAt = '2026-10-14T12:00:00Z', overrides = {}) => ({
  id,
  accountId: 'account-7',
  status: 'completed',
  completedAt,
  ...overrides,
});

function createRunOptions(tasks, notify = async () => {}) {
  return { tasks, settlementAt: SETTLEMENT_AT, ledger: new Map(), notify };
}

test('uses the completed Monday-to-Monday UTC window', () => {
  const { start, end } = getSettlementWindow(SETTLEMENT_AT);
  assert.equal(start.toISOString(), '2026-10-12T00:00:00.000Z');
  assert.equal(end.toISOString(), '2026-10-19T00:00:00.000Z');
});

test('happy path pays 10 credits and notifies after recording payout', async () => {
  const order = [];
  const options = createRunOptions([inside('happy')], async () => order.push(options.ledger.has('happy') ? 'notified-after-write' : 'notified-before-write'));
  const result = await settleRewards(options);
  assert.equal(result.payoutsCreated, 1);
  assert.equal(options.ledger.get('happy').payout.credits, 10);
  assert.deepEqual(order, ['notified-after-write']);
});

test('includes the lower boundary exactly', async () => {
  const options = createRunOptions([inside('lower', '2026-10-12T00:00:00Z')]);
  await settleRewards(options);
  assert.equal(options.ledger.has('lower'), true);
});

test('excludes the upper boundary exactly', async () => {
  const options = createRunOptions([inside('upper', '2026-10-19T00:00:00Z')]);
  await settleRewards(options);
  assert.equal(options.ledger.has('upper'), false);
});

test('converts an offset timestamp by its UTC instant', async () => {
  const options = createRunOptions([inside('offset', '2026-10-12T02:00:00+02:00')]);
  await settleRewards(options);
  assert.equal(options.ledger.has('offset'), true);
});

test('ignores non-completed tasks', async () => {
  const options = createRunOptions([inside('open', undefined, { status: 'in_progress' })]);
  await settleRewards(options);
  assert.equal(options.ledger.size, 0);
});

test('counts a duplicate task ID once in a single input batch', async () => {
  const task = inside('duplicate');
  const options = createRunOptions([task, { ...task }]);
  const result = await settleRewards(options);
  assert.equal(result.payoutsCreated, 1);
  assert.equal(options.ledger.size, 1);
});

test('a retry does not create a second payout or notification after success', async () => {
  const options = createRunOptions([inside('retry')]);
  let notifications = 0;
  options.notify = async () => { notifications += 1; };
  const first = await settleRewards(options);
  const second = await settleRewards(options);
  assert.equal(first.payoutsCreated, 1);
  assert.equal(second.payoutsCreated, 0);
  assert.equal(options.ledger.size, 1);
  assert.equal(notifications, 1);
});

test('notification failure preserves payout and a retry only retries notification', async () => {
  const options = createRunOptions([inside('partial')], async () => { throw new Error('notification unavailable'); });
  const failedRun = await settleRewards(options);
  assert.equal(failedRun.payoutsCreated, 1);
  assert.equal(failedRun.notificationFailures.length, 1);
  assert.equal(options.ledger.has('partial'), true);
  assert.equal(options.ledger.get('partial').notified, false);

  options.notify = async () => {};
  const retriedRun = await settleRewards(options);
  assert.equal(retriedRun.payoutsCreated, 0);
  assert.equal(options.ledger.size, 1);
  assert.equal(options.ledger.get('partial').notified, true);
});

test('rejects a settlement outside Tuesday 09:00 UTC', () => {
  assert.throws(() => getSettlementWindow('2026-10-20T10:00:00Z'), /Tuesday at 09:00/);
});