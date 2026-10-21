import { SETTLEMENT_AT, settleRewards } from './rewards.js';

const tasks = [
  { id: 'task-100', accountId: 'account-7', status: 'completed', completedAt: '2026-10-12T10:00:00Z' },
  { id: 'task-100', accountId: 'account-7', status: 'completed', completedAt: '2026-10-12T10:00:00Z' },
  { id: 'task-101', accountId: 'account-7', status: 'completed', completedAt: '2026-10-19T00:00:00Z' },
];
const ledger = new Map();
const notifications = [];

const result = await settleRewards({
  tasks,
  settlementAt: SETTLEMENT_AT,
  ledger,
  notify: async (payout) => notifications.push(payout.taskId),
});

console.log(JSON.stringify({ result, ledger: [...ledger.values()], notifications }, null, 2));