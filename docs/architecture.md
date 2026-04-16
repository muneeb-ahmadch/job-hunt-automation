# Architecture

This architecture is derived from `plan.md` and should be kept concrete as the implementation grows. The system is a local-first, deterministic pipeline with schema-bound LLM subroutines, lane routing, host-aware queues, human approvals, and local audit trails.

## Product Shape

The product serves one operator. It imports batches of jobs, normalizes and extracts job descriptions, scores fit against a structured career knowledge base, routes every job into an explicit lane, generates truthful artifacts only for top-ranked jobs, executes supported applications through controlled queues, and records every decision locally.

The system has two lanes:

- Lane 1: high-volume ATS/company execution for supported external application surfaces.
- Lane 2: LinkedIn restricted discovery/import/triage/routing/assist only.

LinkedIn must not become the center of the architecture. Jobs sourced from LinkedIn should route into Lane 1 when the underlying application flow is on a supported company or ATS host.

## Runtime Stack

- TypeScript and Node.js LTS.
- pnpm workspace.
- `tsx` for local script and worker execution.
- React and Vite for the local web UI.
- SQLite plus Drizzle ORM for local persistence when the DB package is implemented.
- TypeBox and Ajv for shared schema validation when schema packages are implemented.
- OpenAI Responses API for schema-bound extraction, scoring support, wording, and validation.
- Playwright for headed browser execution and Playwright Test for browser fixtures.
- Vitest for unit and integration tests.
- JSONC config and `.env` secrets.
- Pino structured logs when logging is implemented.

## Layered Flow

```text
Batch Import
  -> Intake Layer
  -> JD Normalizer / Extractor
  -> Fit Scorer
  -> Lane Router
  -> Auto-skip weak or unsupported jobs
  -> Artifact Queue for top jobs only
  -> Artifact Generator
  -> Evidence / Claim Checker
  -> Approval Engine
  -> Execution Queue
  -> Host Bucket Scheduler
  -> API Adapter OR Site Adapter OR Browser Fallback
  -> Submit Gate
  -> Submission Tracker
  -> Retry Queue / Dead Letter Queue / Manual Intervention Queue
  -> Ops Dashboards / Host Health / Metrics
```

## Package Responsibilities

- `packages/schemas`: canonical enums, TypeScript types, and JSON-schema/TypeBox contracts.
- `packages/core`: deterministic normalization, scoring formulas, routing rules, duplicate detection, retry math, and utility logic.
- `packages/db`: SQLite client, Drizzle schema, migrations, repositories, and seeds.
- `packages/registry`: host capability, execution policy, and approval policy loaders/resolvers.
- `packages/scheduler`: queue leasing, host buckets, fairness, pause/resume, retry, dead-letter, and metrics logic.
- `packages/llm`: OpenAI Responses API wrapper, schema validation, prompt/task execution, retries, and local cache.
- `packages/prompts`: versioned prompt files and prompt metadata.
- `packages/renderer`: deterministic renderers for text, Markdown, HTML, PDF, and future DOCX output.
- `packages/browser`: Playwright launch, page detection, field descriptors, checkpoints, snapshots, and browser execution helpers.
- `packages/adapters`: API, Greenhouse, Lever, generic, Workday assist, and LinkedIn restricted adapters.
- `packages/workflows`: orchestration workflows that compose package behavior without embedding host-specific logic.
- `packages/ops`: host health, local dashboards, reports, and cost/cache metrics.
- `packages/shared-ui`: reusable local UI components for status, diff, review, queue, and host health surfaces.

Application shells:

- `apps/web`: local dashboard and review UI.
- `apps/worker`: local worker, queue processor, and CLI entrypoint.

## Data And Persistence

All state is local-first:

- SQLite stores profiles, jobs, extracted requirements, scores, route decisions, queues, policies, artifact metadata, approvals, attempts, retries, dead letters, host health, and audit events.
- Local files store raw imports, generated artifacts, screenshots, DOM snapshots, traces, logs, and fixture data.
- A persistent local browser profile stores user-managed sessions. Cookies and passwords must not be copied to the DB, logs, prompts, or OpenAI requests.

Core DB entities from `plan.md` should be implemented in milestone order: `batch_run`, `job_posting`, `extracted_requirements`, `fit_score`, `lane_route_decision`, `host_capability_profile`, `execution_policy`, `approval_policy`, `artifact_bundle`, `queue_job`, `execution_attempt`, `submission_event`, `retry_event`, `dead_letter_event`, `host_health_snapshot`, and the career knowledge base tables.

## Routing And Execution

Every job must receive an explicit route decision. Route outcomes use these lane types and execution modes:

- Lane types: `linkedin_restricted`, `ats_lane`, `manual_fallback`, `unsupported`.
- Execution modes: `ats_api_first`, `ats_adapter_execution`, `browser_fallback`, `manual_only`.

Execution preference is mandatory:

1. API-first integration when stable public endpoints exist.
2. Structured site adapter when a reliable host-specific adapter exists.
3. Browser automation fallback when automation is viable but no better route exists.
4. Manual takeover when automation risk is too high or capability is insufficient.

The host capability registry is consulted before heuristics. Unknown or degraded hosts should route conservatively.

## Approval Model

Approvals are lane-aware and host-aware:

- LinkedIn restricted lane always requires stricter per-job checkpoints.
- Fragile or high-risk hosts require per-job approval.
- Trusted low-risk Lane 1 hosts may support per-batch artifact and submit approvals only when configured.
- New answer types require manual review before reuse.
- Material changes to recruiter-facing content, profile version, answer sets, or host policy invalidate affected approvals.

Final submit gates are never bypassed silently.

## Artifact Model

Artifacts are generated only for top-ranked jobs that pass fit, duplicate, route, budget, and queue checks. The canonical render source is `resume_data.json`, produced from a prior `resume_plan`.

Application mode:

- Truthful only.
- Evidence checked.
- ATS-safe one-column outputs.
- Uploadable only after approval.

Benchmark mode:

- Visible benchmark banner and watermark.
- Non-submittable.
- Example-only claims explicitly labeled.
- Gap map required.
- Never eligible for upload or submission.

## Browser Automation

Browser automation is an executor, not the decision-maker. It receives a route decision, execution policy, approved artifact bundle, approved answer set, field mapping plan, and submit gate policy.

It must pause on:

- low confidence,
- captcha or anti-bot friction,
- login, consent, or security steps,
- ambiguous field mapping,
- answer invention risk,
- upload or submit checkpoints required by policy.

Real application runs default to headed Playwright with screenshots, DOM snapshots, and failure traces. Fixture tests may run headless.

## Testing Shape

Testing grows by milestone:

- Unit tests for normalization, scoring, routing, policies, retry math, duplicate detection, answer matching, and config validation.
- Schema validation tests for every model/config/queue/artifact contract.
- Queue and scheduler tests for leases, host fairness, pause/resume, retry, and dead-letter behavior.
- Lane routing tests for LinkedIn restrictions and ATS/company preference order.
- Approval tests for per-batch, per-job, invalidation, and submit gates.
- Browser fixture tests for Greenhouse-like, Lever-like, generic, Workday-like, LinkedIn-like, and API-emulated hosts.
- E2E dry-run tests for batch import through execution, retry, dead letter, manual takeover, and reprocessing after profile changes.

## Security And Privacy

- Store secrets only in `.env` or future OS keychain integration.
- Send only minimal selected profile fields/source units to model calls.
- Never send cookies, passwords, or browser sessions to OpenAI.
- Redact secrets, tokens, cookies, passwords, and unnecessary personal data from logs and snapshots.
- Keep dry-run available globally before real execution is enabled.
