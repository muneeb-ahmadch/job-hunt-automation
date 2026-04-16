# Job Hunt Automation

Local-first, human-supervised job application automation for one user. The system is designed around high-volume ATS/company execution, restricted LinkedIn discovery/import/assist, truthful recruiter-facing artifacts, and durable local tracking.

`plan.md` is the product source of truth. This repository is currently in Phase 0 scaffold state: workspace, docs, configs, package shells, and developer scripts exist, but major product flows are intentionally not implemented yet.

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
pnpm lint
pnpm typecheck
pnpm test
```

Run the local shells:

```bash
pnpm dev:web
pnpm dev:worker
```

The Vite app defaults to `http://localhost:5173`. The worker command currently prints scaffold status only.

## Repository Layout

- `apps/web` - local React/Vite UI shell for dashboards and review workflows.
- `apps/worker` - local worker/CLI shell for queue processing and scripts.
- `packages/*` - planned domain packages for schemas, core logic, DB, registry, scheduler, LLM, rendering, browser execution, adapters, workflows, ops, and shared UI.
- `config` - JSONC runtime defaults, host capabilities, execution policies, and approval policies.
- `data` - ignored local runtime data with committed `.gitkeep` placeholders.
- `docs` - architecture, roadmap, and implementation checklist.
- `tests` - Vitest, integration, E2E, fixture, and snapshot scaffolding.

## Commands

- `pnpm run setup:local` - create local data directories.
- `pnpm config:check` - parse JSONC config files and verify scaffold keys.
- `pnpm lint` - run ESLint.
- `pnpm typecheck` - run TypeScript checks.
- `pnpm test` - run Vitest.
- `pnpm test:e2e` - run Playwright tests once E2E fixtures exist.
- `pnpm dev:web` - start the local Vite UI.
- `pnpm dev:worker` - run the worker shell.

## Guardrails

- OpenAI API is the only required paid dependency.
- SQLite, local files, local browser profiles, local UI, and local worker processes remain the default.
- LinkedIn is restricted to discovery, import, triage, routing, and limited assist.
- Recruiter-facing artifacts must never contain unsupported claims.
- Execution preference is API-first, adapter-second, browser-third, manual-last.
- Dry-run mode must exist for any execution path before real submissions are enabled.
