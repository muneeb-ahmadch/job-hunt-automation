# Job Hunt Automation

Local-first, human-supervised job application automation for one user. The system is designed around high-volume ATS/company execution, restricted LinkedIn discovery/import/assist, truthful recruiter-facing artifacts, and durable local tracking.

`plan.md` is the product source of truth. This repository now has the foundation runtime in place: shared schema contracts, config validation, local SQLite migrations, deterministic seed data, file storage setup, structured logging, run metadata, and a persisted queue skeleton. Product flows and live execution are intentionally still disabled.

## Quickstart

Prerequisites:

- Node.js 22 or newer
- Corepack, included with modern Node.js
- An OpenAI API key when LLM-backed tasks are implemented

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
pnpm install
cp .env.example .env
pnpm run setup:local
pnpm config:check
pnpm migrate
pnpm seed
pnpm lint
pnpm typecheck
pnpm test
```

Run the local shells:

```bash
pnpm dev:web
pnpm dev:worker
```

The Vite app defaults to `http://localhost:5173`. The worker command validates runtime config, reads the local SQLite migration state, and prints foundation status. It does not execute applications.

## Repository Layout

- `apps/web` - local React/Vite UI shell for dashboards and review workflows.
- `apps/worker` - local worker/CLI shell for queue processing and scripts.
- `packages/schemas` - TypeBox contracts and Ajv helpers for config, model outputs, queue jobs, batch runs, routes, policies, artifacts, answers, and reviews.
- `packages/core` - runtime config, `.env` handling, local path resolution, storage setup, logging, and run context helpers.
- `packages/db` - better-sqlite3/Drizzle client, additive migration runner, foundation schema, repositories, and deterministic seed data.
- `packages/registry` - config-backed host capability, execution policy, and approval policy loaders/resolvers.
- `packages/scheduler` - SQLite-backed queue manager foundation with lease and host-bucket helpers.
- `packages/*` - additional planned packages for LLM, rendering, browser execution, adapters, workflows, ops, and shared UI.
- `config` - JSONC runtime defaults, host capabilities, execution policies, and approval policies.
- `data` - ignored local runtime data with committed `.gitkeep` placeholders.
- `docs` - architecture, roadmap, and implementation checklist.
- `tests` - Vitest, integration, E2E, fixture, and snapshot scaffolding.

## Commands

- `pnpm run setup:local` - create local data directories.
- `pnpm config:check` - parse JSONC config files and validate app, host, execution, and approval policy schemas.
- `pnpm migrate` - create/update the local SQLite database at `DATABASE_URL` or `./data/local/app.sqlite`.
- `pnpm seed` - insert deterministic foundation fixtures for local smoke testing.
- `pnpm lint` - run ESLint.
- `pnpm typecheck` - run TypeScript checks.
- `pnpm test` - run Vitest.
- `pnpm test:e2e` - run Playwright tests once E2E fixtures exist.
- `pnpm dev:web` - start the local Vite UI.
- `pnpm dev:worker` - run the worker foundation startup check.

## Foundation Runtime

The local foundation currently provides:

- schema contracts from `plan.md` for extraction, fit scoring, lane routing, policies, batches, queues, resume plans, screening answers, reviews, and artifact bundles;
- JSONC config validation before scripts or worker startup;
- `.env` handling that detects OpenAI key presence without logging the key;
- local storage roots for raw imports, exports, screenshots, DOM snapshots, traces, logs, browser profile data, and SQLite;
- an additive SQLite migration runner with a foundation migration note and local rollback guidance;
- deterministic seed data for a single-user profile, one Greenhouse-like job, a route decision, and a queued scoring job;
- a queue manager that can enqueue, lease, complete, and count persisted jobs;
- structured Pino logs under `data/logs` and DB-backed run/audit metadata.

## Guardrails

- OpenAI API is the only required paid dependency.
- SQLite, local files, local browser profiles, local UI, and local worker processes remain the default.
- LinkedIn is restricted to discovery, import, triage, routing, and limited assist.
- Recruiter-facing artifacts must never contain unsupported claims.
- Execution preference is API-first, adapter-second, browser-third, manual-last.
- Dry-run mode must exist for any execution path before real submissions are enabled.
