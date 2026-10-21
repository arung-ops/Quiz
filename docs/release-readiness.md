# Release Readiness and Handoff

## Checklist

- [x] Offline, synthetic fixture; no live financial or rewards service is called.
- [x] Duplicate-ID baseline demonstrated red with `npm run test:faulty`.
- [x] Corrected reference suite demonstrated green with `npm test`.
- [x] Cutoff, UTC offset, duplicate input, retry, and notification partial-failure cases are covered.
- [ ] Validate equivalent uniqueness and idempotency guarantees against the intended durable storage engine.
- [ ] Exercise concurrent workers and transaction isolation.
- [ ] Validate the production scheduler, task ownership rules, and notification retry/outbox behavior with service owners.
- [ ] Review operational metrics and reconciliation/alerting before any real release.

## Final run and decision

Observed in this workspace:

- `npm test`: 10 passed, 0 failed; exit code 0.
- `npm run test:faulty`: 0 passed, 1 failed; exit code 1, with actual payout count 2 versus expected 1.
- `npm run demo`: created one 10-credit payout for `task-100`, marked it notified, and excluded the task exactly at the upper boundary.

The failing baseline is intentional; this fixture has no dependency installation step.

**Decision: suitable as an assessment/reference implementation only; not release-ready for a live service.** The in-memory `Map` cannot provide durable uniqueness, transaction isolation, or cross-process idempotency. This project is deliberately not wired to production systems.

## Remaining gaps

- No persistence, transaction, locking, or concurrent worker behavior.
- No external notifier, durable outbox, delivery deduplication, or alerting.
- The fixture assumes immutable global task IDs and account ownership; those assumptions require product/data-owner confirmation.
- The window interpretation is explicitly the last completed Monday-to-Monday week; confirm this against the intended business rule before implementation elsewhere.
- No historical failure rates were supplied, so likelihood ranking is qualitative and uncertain.

## Handoff

1. Run `npm test` for the corrected reference checks.
2. Run `npm run test:faulty` to see the expected failing baseline reproduction.
3. Read [directive.md](../directive.md), [test cases](test-cases.md), and [defect report](defect-report.md).
4. Before adapting this to a real service, confirm the week/window and ownership assumptions, then port the invariant to the durable payout boundary and add storage-level uniqueness plus concurrency tests.