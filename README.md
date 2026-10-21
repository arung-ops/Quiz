# Weekly Rewards Assessment Fixture

This is a local, synthetic Node.js project. It does not connect to a live rewards, payment, or MUST system. It uses only the Node.js standard library.

## Run

Use Node.js 20 or later:

```sh
npm test
npm run demo
```

`npm run test:faulty` intentionally exits non-zero. It runs the same duplicate-ID contract against the deliberately faulty implementation, reproducing the regression before the corrected reference is exercised by `npm test`.

## Assessment outputs

- [Final assessment directive](Final%20directive.md)
- [Loom video transcript](Loom%20Video%20Transcript.md)
- [Project intent](intent.md)
- [Directive and artifact index](directive.md)
- [Test cases and observed results](docs/test-cases.md)
- [Defect and root-cause report](docs/defect-report.md)
- [Release-readiness checklist and handoff](docs/release-readiness.md)

Implementation: [corrected reference](src/rewards.js), [faulty baseline](src/faulty-rewards.js), [automated checks](test/rewards.test.js).