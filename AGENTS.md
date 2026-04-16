# AGENTS.md

## Project Goal

Build a local-first, human-supervised, single-user job application automation system. The product optimizes high-volume execution on supported ATS and company-hosted application surfaces while preserving truthful recruiter-facing outputs, explicit approval gates, and full local tracking.

`plan.md` is the source of truth for product scope, architecture, constraints, acceptance criteria, and build order. If this file conflicts with `plan.md`, follow `plan.md` and update this file in the same change.

## Non-Negotiable Constraints

- Preserve local-first operation: SQLite, local files, local browser profile, local UI, and local worker pool by default.
- Keep OpenAI API as the only required paid dependency.
- Do not add paid SaaS workflow tools, paid browser automation services, hosted vector DBs, paid resume builders, or proxy networks as required dependencies.
- Do not automate blind mass-applying or uncontrolled browsing across unknown surfaces.
- Treat LinkedIn as a restricted discovery/import/triage/assist lane, not the high-volume submit lane.
- Never fabricate recruiter-facing facts, metrics, titles, dates, degrees, tools, achievements, ownership, scope, or eligibility.
- Any `unsupported` claim blocks recruiter-facing export and upload eligibility.
- Benchmark artifacts must be visibly labeled, non-submittable, and impossible to upload or submit through execution paths.
- Do not expose cookies, passwords, tokens, or browser session data to LLM calls or logs.
- No silent final submission outside the configured approval policy for the lane, host, and risk tier.

## Architecture Guardrails

- Use a hybrid deterministic pipeline with narrow schema-bound LLM subroutines.
- Do not build a single freeform agent that controls the workflow.
- Route every job explicitly into one of the supported lane/execution outcomes.
- Preserve the mandatory execution preference order: API-first, structured adapter second, browser fallback third, manual takeover last.
- Keep queues, workflow states, approvals, retries, dead letters, host health, and execution attempts persisted locally.
- Make every batch and queue operation resumable.
- Use a persistent host capability registry before host heuristics.
- Validate model outputs, config, queue payloads, adapter contracts, and policy objects with schemas.
- Cache by stable hashes where practical: job content, profile version, prompt version, source-unit hash, output mode, and answer context.
- Store screenshots, DOM snapshots, step logs, and error summaries for browser execution and failures.
- Keep prompts narrow, versioned, schema-bound, and unable to introduce new recruiter-facing facts.

## Coding Standards

- Prefer small, working, testable increments.
- Follow the package boundaries in `docs/architecture.md` and `plan.md`.
- Keep changes reversible and scoped to the current milestone.
- Add abstractions only when they match the planned architecture or remove real duplication.
- Use TypeScript in strict mode.
- Prefer shared schema/types from `packages/schemas` over local ad hoc shapes.
- Use JSONC for operator-editable config and `.env` only for secrets/local paths.
- Keep browser automation headed for real application flows and headless only for tests/fixtures.
- Default execution-related development to dry-run until a policy, adapter, and approval path are tested.
- Redact secrets and sensitive personal data from logs.
- Do not introduce unrelated feature work while scaffolding or hardening.

## Commands

Use Corepack-managed pnpm:

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
pnpm install
```

Validation commands:

```bash
pnpm config:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

Local run commands:

```bash
pnpm run setup:local
pnpm dev:web
pnpm dev:worker
```

Migration and maintenance command stubs:

```bash
pnpm migrate
pnpm seed
pnpm import:profile
pnpm requeue:batch
pnpm host-health:recompute
pnpm purge:artifacts
```

## Migration And Change Policy

- Phase 0 may add scaffolding, configs, docs, package shells, tests, and developer ergonomics only.
- Schema and DB changes must be additive unless a milestone explicitly requires a breaking change.
- Every DB migration must include a plain-English note, a rollback strategy when practical, and fixture coverage.
- Runtime policies must be config-driven where host or lane behavior can differ.
- Any change that could affect submissions must include dry-run coverage before enabling real execution.
- Do not change generated artifacts, approval semantics, or route decisions without tests showing the intended behavior.
- Preserve audit history rather than mutating prior runs in place.

## Definition Of Done For Future Tasks

- The change is aligned with the milestone order in `docs/build-roadmap.md`.
- It preserves local-first behavior and the OpenAI-only paid dependency rule.
- It keeps LinkedIn restricted and Lane 1 ATS/company execution primary.
- It validates relevant schemas, configs, queue payloads, and model outputs.
- It includes focused tests for new deterministic logic, policies, routes, queues, or safety gates.
- It keeps dry-run behavior intact for execution paths.
- It records or preserves traceability to source data, profile version, prompt version, and artifact version where relevant.
- It blocks unsupported recruiter-facing claims and unresolved placeholders from upload/submission.
- It updates docs, config examples, and TODO checklists when behavior or milestone status changes.
- `pnpm config:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` pass, or any inability to run them is documented with the exact blocker.
