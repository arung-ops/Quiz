# Test Cases and Results

Run the passing reference suite with `npm test`. It currently contains 10 automated checks. The separate baseline command `npm run test:faulty` is expected to fail with `2 !== 1`, proving the duplicate-ID regression exists in the faulty implementation.

| ID | Case and input | Expected outcome | Automated result |
| --- | --- | --- | --- |
| T01 | Tuesday 2026-10-20 09:00 UTC; completed task at 2026-10-14 12:00 UTC | Window is `[2026-10-12T00:00Z, 2026-10-19T00:00Z)`; create one 10-credit payout, then notify | Pass |
| T02 | Task completed exactly at `2026-10-12T00:00:00Z` | Included; one payout | Pass |
| T03 | Task completed exactly at `2026-10-19T00:00:00Z` | Excluded; no payout | Pass |
| T04 | Task timestamp `2026-10-12T02:00:00+02:00` | Convert to `2026-10-12T00:00:00Z`; included | Pass |
| T05 | Task status is `in_progress`, timestamp inside window | Excluded; no payout | Pass |
| T06 | Same eligible task ID appears twice in one input batch | Count once; one 10-credit payout | Pass in corrected reference; fails against faulty baseline |
| T07 | Process same eligible task in two settlement attempts | First creates payout and notification; retry creates neither a second payout nor duplicate successful notification | Pass |
| T08 | Payout succeeds, notifier throws | Keep payout; return notification failure; do not reverse credits | Pass |
| T09 | Retry T08 with notifier available | Do not pay again; retry outstanding notification and mark notified | Pass |
| T10 | Settlement timestamp is Tuesday 10:00 UTC | Reject invalid schedule time | Pass |

The automated suite validates these outcomes against in-memory maps and a stub notifier. It does not validate a production database, queue, or external notification provider.