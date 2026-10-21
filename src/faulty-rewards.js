import { getSettlementWindow, REWARD_CREDITS, SETTLEMENT_AT } from './rewards.js';

export function settleRewardsFaulty({ tasks, settlementAt = SETTLEMENT_AT }) {
  const { start, end } = getSettlementWindow(settlementAt);
  return tasks
    .filter((task) => {
      const completedAt = new Date(task.completedAt);
      return task.status === 'completed' && task.id && task.accountId && !Number.isNaN(completedAt.valueOf()) && completedAt >= start && completedAt < end;
    })
    .map((task) => ({ taskId: task.id, accountId: task.accountId, credits: REWARD_CREDITS }));
}