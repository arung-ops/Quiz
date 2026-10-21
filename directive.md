# Assessment Directive

## Scope

Assess a fictional weekly rewards settlement flow using a sanitized, offline Node.js fixture. These rules are assessment rules only; they do not describe a live MUST product or establish that any incident occurred.

## Business rules and assumptions

- Settlement is scheduled for Tuesday at 09:00 UTC.
- To avoid settling future work, this fixture interprets the period as the most recently completed Monday-to-Monday interval: the Monday 00:00 UTC seven days before the Monday immediately preceding settlement, through that immediately preceding Monday 00:00 UTC. The start is inclusive and the end is exclusive. For a Tuesday 2026-10-20 run, the interval is `[2026-10-12T00:00:00Z, 2026-10-19T00:00:00Z)`.
- Only tasks with status `completed` and a completion instant in that interval qualify. ISO timestamps with offsets are converted by their instant to UTC.
- Each qualifying task ID earns 10 test credits and may be paid at most once across retries. Task IDs are globally unique and immutable; duplicate rows for an ID represent the same task and owner.
- The account owner recorded on a completed task is immutable for payout. Changes to account membership do not transfer historical tasks.
- The reward value and schedule are fixed in this fixture. No runtime admin settings exist; a hypothetical future admin change would apply only to windows not yet settled.
- A notification is attempted only after the payout is recorded. Notification failure is reported separately and never removes or reverses a payout. A later settlement retry may retry an outstanding notification without paying again.

## Ranked possible failures

This ranking is a reasoned assessment, not incident history. Frequency is uncertain because no production telemetry or historical data was supplied.

| Rank | Possible failure | User impact | Likelihood (uncertain) | Effort |
| --- | --- | --- | --- | --- |
| 1 | Duplicate task IDs or settlement retries create a second credit payout | High: incorrect balances and reconciliation work | Medium: duplicate delivery/retries are common integration conditions, but no local frequency data | Low to medium |
| 2 | UTC boundary or offset conversion is wrong, omitting or including a task in the wrong week | Medium to high: delayed or premature rewards | Medium: date arithmetic and timezone boundaries are error-prone; no incident evidence | Medium |
| 3 | Notification failure is treated as settlement failure and payout is rolled back, or users receive no notice | Medium: balance may be wrong or user remains uninformed | Medium: depends on notification and persistence coupling; no telemetry supplied | Medium |

## Selected failure

Investigate duplicate payout from repeated task IDs and retries. The reproducible defect is an implementation-level omission of task-ID deduplication/idempotency. The fixture intentionally demonstrates the faulty behavior, then checks a corrected reference implementation.

## Outputs

- Runnable project and commands: [README](README.md)
- Eight-plus cases, input data, expected behavior, and observed test results: [test cases](docs/test-cases.md)
- Reproduction, actual/expected behavior, severity, root cause, evidence, and proposed fix: [defect report](docs/defect-report.md)
- Release gates, remaining gaps, readiness decision, and handoff: [release checklist](docs/release-readiness.md)