export const REWARD_CREDITS = 10;
export const SETTLEMENT_AT = '2026-10-20T09:00:00.000Z';

const DAY_MS = 24 * 60 * 60 * 1000;

export function getSettlementWindow(settlementAt) {
  const settledAt = new Date(settlementAt);
  if (Number.isNaN(settledAt.valueOf())) {
    throw new RangeError('settlementAt must be a valid timestamp');
  }
  if (settledAt.getUTCDay() !== 2 || settledAt.getUTCHours() !== 9 || settledAt.getUTCMinutes() !== 0 || settledAt.getUTCSeconds() !== 0 || settledAt.getUTCMilliseconds() !== 0) {
    throw new RangeError('settlementAt must be Tuesday at 09:00:00.000 UTC');
  }

  const daysSinceMonday = (settledAt.getUTCDay() + 6) % 7;
  const windowEnd = Date.UTC(settledAt.getUTCFullYear(), settledAt.getUTCMonth(), settledAt.getUTCDate() - daysSinceMonday);
  return {
    start: new Date(windowEnd - 7 * DAY_MS),
    end: new Date(windowEnd),
  };
}

function isEligible(task, start, end) {
  if (task.status !== 'completed' || !task.id || !task.accountId) return false;
  const completedAt = new Date(task.completedAt);
  return !Number.isNaN(completedAt.valueOf()) && completedAt >= start && completedAt < end;
}

export async function settleRewards({ tasks, settlementAt = SETTLEMENT_AT, ledger, notify }) {
  if (!Array.isArray(tasks) || !ledger || typeof ledger.has !== 'function' || typeof ledger.set !== 'function' || typeof notify !== 'function') {
    throw new TypeError('tasks, a Map-like ledger, and a notify function are required');
  }

  const { start, end } = getSettlementWindow(settlementAt);
  const uniqueTasks = new Map();
  for (const task of tasks) {
    if (isEligible(task, start, end) && !uniqueTasks.has(task.id)) uniqueTasks.set(task.id, task);
  }

  let payoutsCreated = 0;
  const notificationFailures = [];
  for (const task of uniqueTasks.values()) {
    let payout = ledger.get(task.id);
    if (!payout) {
      payout = {
        taskId: task.id,
        accountId: task.accountId,
        credits: REWARD_CREDITS,
        windowStart: start.toISOString(),
        windowEnd: end.toISOString(),
      };
      ledger.set(task.id, { payout, notified: false });
      payoutsCreated += 1;
    }

    const record = ledger.get(task.id);
    if (!record.notified) {
      try {
        await notify(record.payout);
        record.notified = true;
      } catch (error) {
        notificationFailures.push({ taskId: task.id, message: error.message });
      }
    }
  }

  return { payoutsCreated, notificationFailures };
}