# Implementation TODO

## Phase 0: Foundations

- [x] Add root workspace manifest.
- [x] Add pnpm workspace file.
- [x] Add TypeScript config.
- [x] Add lint/test/typecheck scripts.
- [x] Add `.env.example`.
- [x] Add config JSONC scaffold.
- [x] Add app and package shells.
- [x] Add README quickstart.
- [x] Add `AGENTS.md`.
- [x] Add architecture and roadmap docs.
- [x] Add lockfile after dependency installation.
- [x] Confirm validation commands pass in the current workspace.

## Phase 1: Shared Schemas And Config Validation

- [x] Implement TypeBox schema source files.
- [x] Add Ajv validator helpers.
- [x] Port appendix JSON schemas from `plan.md`.
- [x] Add schema fixtures for valid payloads.
- [x] Add schema fixtures for invalid payloads.
- [x] Enforce config schema with Ajv.
- [x] Add schema tests for all model output contracts.

## Phase 2: DB Package And Local Migrations

- [x] Add Drizzle and SQLite dependencies.
- [x] Implement SQLite client.
- [x] Implement initial schema tables.
- [x] Add migration run command.
- [x] Add repository helpers.
- [x] Add fixture seed command.
- [x] Add DB integration tests.

## Phase 3: Deterministic Core Logic

- [ ] Implement batch input parser.
- [ ] Implement JD normalization.
- [ ] Implement duplicate detection.
- [ ] Implement deterministic fit score formula.
- [ ] Implement lane router rules.
- [ ] Implement queue priority calculation.
- [ ] Implement retry/backoff helpers.
- [ ] Add unit tests for hard gates and safe routing defaults.

## Phase 4: LLM Wrapper And Prompt Contracts

- [ ] Add OpenAI Responses API wrapper.
- [ ] Add prompt registry and version metadata.
- [ ] Add JD extraction task wrapper.
- [ ] Add fit scoring support task wrapper.
- [ ] Add lane routing support task wrapper.
- [ ] Add answer generation task wrapper.
- [ ] Add evidence and unsupported-claim check wrappers.
- [ ] Add validation retry and fallback behavior.
- [ ] Add local cache by input hash.

## Phase 5: Batch Intake, Extraction, Scoring, Routing

- [ ] Implement batch import workflow.
- [ ] Queue normalize jobs after import.
- [ ] Run normalize, extract, score, and route stages.
- [ ] Persist extraction, score, and route results.
- [ ] Auto-skip weak jobs.
- [ ] Add triage API endpoints.
- [ ] Add intake and triage UI.
- [ ] Add E2E dry-run fixture for batch triage.

## Phase 6: Core Scheduler And Queue Management

- [x] Implement queue manager foundation.
- [x] Implement lease acquisition and completion foundation.
- [ ] Implement stale lease recovery.
- [ ] Implement host bucket controls.
- [ ] Implement fairness scheduling.
- [ ] Implement pause/resume.
- [ ] Implement retry queue.
- [ ] Implement dead-letter queue.
- [ ] Add scheduler tests.

## Phase 7: Source-Of-Truth Profile And Artifact Generation

- [ ] Implement master profile import/edit.
- [ ] Implement experience bank.
- [ ] Implement project bank.
- [ ] Implement skills taxonomy.
- [ ] Implement evidence items.
- [ ] Implement reusable answer library.
- [ ] Implement resume planning.
- [ ] Implement text, Markdown, HTML, and PDF renderers.
- [ ] Implement evidence and unsupported-claim blocking.
- [ ] Add artifact fixture snapshots.

## Phase 8: Batch Review And Approval UX

- [ ] Implement batch review dashboard.
- [ ] Implement artifact review UI.
- [ ] Implement answer review UI.
- [ ] Implement per-job approval.
- [ ] Implement per-batch approval.
- [ ] Persist review decisions.
- [ ] Implement approval invalidation rules.
- [ ] Implement submit gate review.

## Phase 9: Lane 1 Execution Adapters

- [ ] Add adapter registry.
- [ ] Implement API-first hook interface.
- [ ] Implement Greenhouse adapter.
- [ ] Implement Lever adapter.
- [ ] Implement generic company form adapter.
- [ ] Implement upload handling.
- [ ] Persist execution attempts.
- [ ] Persist submission events.
- [ ] Add dry-run execution tests.

## Phase 10: Browser Fallback And Workday Assist

- [ ] Implement persistent Playwright launcher.
- [ ] Implement page classification.
- [ ] Implement field descriptor extraction.
- [ ] Implement field mapping checkpoints.
- [ ] Implement screenshot and DOM snapshot capture.
- [ ] Implement Workday assist-first path.
- [ ] Implement manual takeover queue.
- [ ] Add browser fixture tests.

## Phase 11: LinkedIn Restricted Discovery / Import / Assist

- [ ] Implement selected URL import only.
- [ ] Add restricted-lane warnings.
- [ ] Implement JD extraction or paste fallback.
- [ ] Route off-platform apply URLs into Lane 1.
- [ ] Implement limited Easy Apply assist.
- [ ] Enforce stricter per-job approvals.
- [ ] Add tests proving no high-volume LinkedIn execution path exists.

## Phase 12: Reliability, Ops, And Hardening

- [ ] Implement host health snapshots.
- [ ] Add queue dashboard.
- [ ] Add retry dashboard.
- [ ] Add dead-letter dashboard.
- [ ] Add manual intervention dashboard.
- [ ] Add cost and cache metrics.
- [ ] Add host pause/cool-off controls.
- [ ] Add runbooks and adapter authoring guide.
- [ ] Stabilize full dry-run regression suite.
