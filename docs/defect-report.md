# Defect Report: Duplicate Task IDs Can Be Paid Twice

## Summary

**Severity: High for a real rewards ledger; assessment confidence: medium.** A repeated task record can produce more than one 10-credit payout for one task ID. Severity is based on incorrect user balances and reconciliation risk, not on a known incident. Actual frequency is unknown; no production telemetry or incident history was provided.

## Reproduction

1. Use Node.js 20 or later in this project.
2. Run `npm run test:faulty`.
3. Inspect the failing assertion: the duplicate task input yields two payouts where the contract expects one.

Fixture input: two identical rows with ID `task-duplicate`, account `account-7`, status `completed`, and completion time `2026-10-14T12:00:00Z`; settle at `2026-10-20T09:00:00Z`.

## Expected vs. actual

- Expected: one payout record for `task-duplicate`, worth 10 credits; subsequent duplicate delivery or retry leaves the payout count unchanged.
- Actual in the faulty baseline: two payout objects are produced for the same task ID because every qualifying row is mapped independently and there is no deduplication or idempotency check.

## Root cause and evidence

The faulty baseline in [src/faulty-rewards.js](../src/faulty-rewards.js) filters eligible rows and maps every row to a payout. It neither groups by task ID nor checks an existing payout ledger. The red regression assertion in [test/faulty-regression.test.js](../test/faulty-regression.test.js) checks the required one-payout invariant and fails against that behavior. The corrected implementation in [src/rewards.js](../src/rewards.js) uses a unique-task map and a task-ID-keyed ledger; its passing checks are in [test/rewards.test.js](../test/rewards.test.js).

This is evidence about the included reference code only, not evidence that an external product has the defect.

## Proposed fix

Use task ID as an idempotency key at the durable payout boundary, enforce uniqueness in storage, and treat retries as reads of the existing payout. Deduplicate within each batch as well. Record the payout before attempting notification; track notification delivery separately so notification failure cannot roll back credits.

## Release checks that should block

- A regression test proves duplicate IDs in one batch create exactly one payout.
- A retry/idempotency integration test proves the durable ledger has at most one payout per task ID under repeated delivery.
- Persistence constraint and concurrent-settlement tests verify two workers cannot race to create duplicate payouts.
- Partial-failure test verifies notification errors leave the payout committed and are retryable.