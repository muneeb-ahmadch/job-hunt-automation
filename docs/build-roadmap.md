# Build Roadmap

Milestones follow the order in `plan.md`. Do not skip ahead into real execution features before the foundations, schemas, DB, routing, queueing, approvals, and dry-run paths exist.

## Phase 0: Foundations

Dependencies: none.

Deliverables:

- pnpm workspace scaffold.
- Base TypeScript, lint, test, and script setup.
- JSONC config scaffold.
- Host capability, execution policy, and approval policy config placeholders.
- Package and app shells.
- Data and fixture directories.
- Initial docs and implementation checklists.

Acceptance criteria:

- Repo boots locally after `pnpm install`.
- `pnpm run setup:local` creates local runtime directories.
- `pnpm config:check` parses config files.
- `pnpm lint`, `pnpm typecheck`, and `pnpm test` pass.
- No major product features or live execution paths are implemented.

## Phase 1: Shared Schemas And Config Validation

Dependencies: Phase 0.

Deliverables:

- TypeBox schemas for job extraction, fit scoring, lane route decisions, queue jobs, batch runs, execution policies, host capability profiles, resume plans, screening answers, and review decisions.
- Ajv validation helpers.
- Schema fixtures for valid and invalid examples.
- Stronger config validation against `config/schemas/app-config.schema.json`.

Acceptance criteria:

- Every schema has passing valid fixtures and failing invalid fixtures.
- Config validates before app/worker startup.
- Model output contracts are represented in code but not yet wired to OpenAI calls.

## Phase 2: DB Package And Local Migrations

Dependencies: Phase 1.

Deliverables:

- SQLite/Drizzle client.
- Initial migrations for core profile, job, batch, route, policy, queue, artifact, approval, execution, retry, dead-letter, and host health tables.
- Repository helpers for basic CRUD.
- Fixture seed command.

Acceptance criteria:

- `pnpm migrate` creates the local DB.
- `pnpm seed` inserts deterministic fixtures.
- Migration state survives restart.
- DB tests cover table creation and basic repository behavior.

## Phase 3: Deterministic Core Logic

Dependencies: Phase 1 and Phase 2.

Deliverables:

- Batch input parsing.
- JD text normalization.
- Duplicate detection.
- Fit scoring formula.
- Lane routing rules.
- Queue priority calculation.
- Retry/backoff helpers.
- Host bucket derivation.

Acceptance criteria:

- Jobs can be parsed from pasted text, URLs, CSV, newline lists, and clipboard-like input.
- Duplicate jobs are suppressed before artifact generation.
- Every scored job receives a route decision.
- Low-fit jobs auto-skip according to thresholds.
- Unit tests cover hard gates and route safety defaults.

## Phase 4: LLM Wrapper And Prompt Contracts

Dependencies: Phase 1 and Phase 3.

Deliverables:

- OpenAI Responses API wrapper.
- Prompt registry/version metadata.
- Schema-bound task wrappers for JD extraction, fit scoring support, routing support, answer generation, and claim checks.
- Validation retry once with feedback.
- Local cache keyed by stable hashes.

Acceptance criteria:

- Invalid model output fails closed or falls back to manual review.
- Prompts cannot introduce unsupported recruiter-facing facts.
- Token usage and cache metadata are recorded for each task.

## Phase 5: Batch Intake, Extraction, Scoring, Routing

Dependencies: Phase 2, Phase 3, and Phase 4.

Deliverables:

- Batch import workflow.
- Normalize, extract, score, route pipeline.
- Initial queue insertion.
- Local API endpoints for triage UI.
- Triage UI for batch progress and route visibility.

Acceptance criteria:

- User can import many jobs.
- Jobs normalize, extract, score, and route in batch.
- Weak jobs are skipped.
- Results persist locally and can be resumed after restart.

## Phase 6: Core Scheduler And Queue Management

Dependencies: Phase 2 and Phase 3.

Deliverables:

- Queue tables and queue manager.
- Lease manager with stale lease recovery.
- Host buckets with concurrency and rate limits.
- Fairness logic.
- Pause/resume controls.
- Retry and dead-letter queues.

Acceptance criteria:

- Jobs can be queued, leased, released, retried, and dead-lettered.
- Host-specific concurrency is enforced.
- Queue state survives restart.
- Tests cover lease expiry, retry budget, pause/resume, and host fairness.

## Phase 7: Source-Of-Truth Profile And Artifact Generation

Dependencies: Phase 2, Phase 4, and Phase 5.

Deliverables:

- Master profile import/edit.
- Experience bank, project bank, skills taxonomy, evidence items, reusable answers.
- Resume plan and artifact bundle records.
- Text, Markdown, HTML, and PDF rendering.
- Evidence and unsupported-claim checks.
- Screening answer generation and reuse.

Acceptance criteria:

- Top jobs generate truthful artifact bundles only.
- Unsupported claims block recruiter-facing export.
- Benchmark artifacts are visibly labeled and non-submittable.
- Answers are reusable and reviewable.

## Phase 8: Batch Review And Approval UX

Dependencies: Phase 6 and Phase 7.

Deliverables:

- Batch review dashboard.
- Artifact and answer review UI.
- Per-job and per-batch approval flows.
- Approval persistence.
- Approval invalidation rules.
- Submit gate resolution.

Acceptance criteria:

- User can batch-approve low-risk trusted host artifacts.
- User can individually review risky jobs.
- Policies differ by lane, host, and risk tier.
- Material content changes invalidate approval.

## Phase 9: Lane 1 Execution Adapters

Dependencies: Phase 6 and Phase 8.

Deliverables:

- API-first hook points.
- Greenhouse adapter.
- Lever adapter.
- Generic company form support.
- Upload handling.
- Submit gates.
- Execution attempt and submission event tracking.

Acceptance criteria:

- Supported Lane 1 targets execute end-to-end in dry-run.
- Host policies, rate limits, and approvals are enforced.
- Queue throughput and failures are measurable.

## Phase 10: Browser Fallback And Workday Assist

Dependencies: Phase 9.

Deliverables:

- Browser fallback runtime.
- Generic field extraction.
- Field mapping checkpoints.
- Workday assist-first flow.
- Manual takeover queue.
- Screenshot, DOM snapshot, and trace capture.

Acceptance criteria:

- Fallback works when no first-class adapter exists.
- Workday is assist-first and does not claim robust full automation.
- Manual takeover preserves prepared work and audit context.

## Phase 11: LinkedIn Restricted Discovery / Import / Assist

Dependencies: Phase 10.

Deliverables:

- LinkedIn selected-URL import flow.
- Restricted-lane warnings.
- Easy Apply limited assist.
- Routing from LinkedIn into Lane 1 when the apply URL leaves LinkedIn.
- Stricter approval gates.

Acceptance criteria:

- LinkedIn jobs can be imported and triaged.
- Easy Apply assist remains constrained and per-job gated.
- No high-volume autonomous LinkedIn execution path exists.

## Phase 12: Reliability, Ops, And Hardening

Dependencies: all prior phases.

Deliverables:

- Host health metrics.
- Retry, dead-letter, manual intervention, cost, and cache dashboards.
- Host pause/cool-off controls.
- Purge and maintenance scripts.
- Runbooks and adapter authoring guide.
- Regression stabilization.

Acceptance criteria:

- Failures are inspectable.
- Hosts can be paused and resumed.
- Retries and dead letters are visible.
- Docs support safe local operation.
- MVP definition of done from `plan.md` is satisfied.
