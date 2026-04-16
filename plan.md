# 1. Executive Summary

This system is a **local-first, human-supervised, high-volume job application automation system** for one user. It is designed to maximize throughput on supported ATS and company-hosted application surfaces while keeping recruiter-facing outputs truthful, keeping platform-sensitive behavior constrained, and remaining practical for a Codex agent to build end-to-end.

The system automates:

* importing many jobs from pasted text, selected LinkedIn URLs, and company/ATS URLs,
* normalizing and structuring many job descriptions in batches,
* scoring fit against a structured career knowledge base,
* auto-skipping most weak-fit jobs,
* generating ATS-friendly tailored artifact bundles only for top-ranked jobs,
* reusing approved answers across repeated questions,
* executing applications at scale on supported ATS/company targets,
* tracking queues, approvals, execution attempts, retries, failures, and outcomes locally.

The system does **not** automate:

* blind mass-applying across unknown surfaces,
* high-volume autonomous LinkedIn execution,
* uncontrolled browsing through LinkedIn search results,
* recruiter-facing claims that are not supported by the user’s source-of-truth profile,
* silent submission outside the configured approval policy for the current lane and host risk tier.

## Two-Lane Operating Model

The architecture is explicitly split into two operational lanes.

### LANE 1 — HIGH-VOLUME ATS / COMPANY-SITE EXECUTION LANE

This is the primary throughput lane.

It is optimized for:

* batch job intake,
* batch JD normalization and scoring,
* queue-based prioritization,
* bulk tailored artifact generation,
* reusable answer application,
* high-volume execution on supported ATS and company-hosted application surfaces,
* API-first submission where public endpoints exist,
* structured adapter execution second,
* browser automation fallback third,
* manual takeover last.

Priority targets in this lane:

* Greenhouse
* Lever
* generic company career sites
* Workday in assist-first / partial automation mode unless a robust adapter exists

This lane is where the system pushes scale aggressively.

### LANE 2 — LINKEDIN RESTRICTED DISCOVERY / IMPORT / ASSIST LANE

This is not the main high-volume execution lane.

It is optimized for:

* discovery assistance,
* importing selected job URLs,
* extracting or pasting JD text,
* triaging and routing jobs into Lane 1 where applicable,
* limited user-initiated Easy Apply assist in narrow, higher-friction cases.

This lane is explicitly constrained to:

* discovery,
* intake,
* triage,
* routing,
* limited assistive interaction.

It is not the architectural center of the system.

## Recommended Operating Mode

Default posture:

1. Import many jobs into a batch.
2. Normalize and extract many JDs.
3. Score many jobs.
4. Auto-skip most low-fit or high-risk jobs.
5. Route each remaining job into the correct lane.
6. Batch-generate artifacts only for top-ranked jobs.
7. Batch-review low-risk artifacts and answers where policy allows.
8. Execute at scale on supported Lane 1 ATS/company targets using host-aware queues, throttling, retries, and failure recovery.
9. Keep LinkedIn constrained to discovery/import/manual-assist behavior.
10. Track all results, retries, approvals, and outcomes locally.

This is **not** a LinkedIn-centered blind-submit bot. It is a **lane-aware, queue-based, ATS-first application system** optimized for local execution, low cost, truthful outputs, and measurable throughput.

---

# 2. Product Goals

## Primary Goals

1. **Ingest jobs in batches**

   * Accept pasted JD text.
   * Accept selected LinkedIn job URLs in restricted mode.
   * Accept company/ATS URLs.
   * Support CSV, newline, and clipboard batch import formats.
   * Store raw and normalized job content locally.

2. **Score job fit at scale**

   * Compare each JD against the user’s structured career knowledge base.
   * Produce transparent fit scores with rationale, missing evidence, execution risk, and lane suitability.
   * Auto-skip weak-fit jobs early to preserve time and token budget.

3. **Route every job explicitly**

   * Route each job into one of:

     * `linkedin_restricted`
     * `ats_api_first`
     * `ats_adapter_execution`
     * `browser_fallback`
     * `manual_only`

4. **Prioritize ATS/company throughput**

   * Prefer supported external ATS and company-hosted sites for scaled execution.
   * Group jobs by host and execution mode.
   * Apply host-aware throttling, concurrency limits, retries, and cool-off windows.

5. **Generate truthful artifact bundles in batches**

   * Assemble tailored resumes from verified source data, not from freeform invention.
   * Generate optional tailored cover letters and screening answers only for jobs above threshold.
   * Reuse approved answers whenever possible.
   * Produce artifact bundles suitable for queue-based execution.

6. **Support lane-aware review and approval**

   * Enable per-job approval where needed.
   * Enable per-batch approval for trusted, low-risk ATS flows.
   * Support artifact approval policies, answer approval policies, and submit-gate policies by lane, host, and risk tier.

7. **Execute supported applications at scale**

   * Use API-first submission where feasible.
   * Use structured adapters second.
   * Use browser automation fallback third.
   * Support resumable execution, retries, dead-letter queues, and manual takeover.

8. **Track all execution locally**

   * Record jobs, batches, queues, artifacts, approvals, execution attempts, retries, host health, and outcomes in local storage.

## Secondary Goals

* Reduce median time per application in Lane 1.
* Maintain a reusable answer library with freshness and approval rules.
* Provide audit trails, screenshots, DOM snapshots, and execution logs.
* Support dry-run mode for safe testing.
* Support deterministic template-based resume generation.
* Learn local host behavior over time through a host capability registry and host health snapshots.
* Provide clear queue dashboards, retry dashboards, and manual intervention queues.

## Non-Goals

* High-volume autonomous LinkedIn execution.
* Blind mass-applying to every discovered role.
* Multi-user collaboration.
* CRM-grade recruiting analytics.
* Fancy design resumes that trade away ATS safety.
* End-to-end autonomous navigation of every unknown or hostile application flow.
* Fabricating or embellishing unsupported recruiter-facing background details.
* Replacing the user’s judgment on whether to apply.
* Defeating captchas, rate limits, or authentication controls.

---

# 3. Constraints and Risk Boundaries

## Budget Constraints

* Default paid dependency: **OpenAI API only**.
* No paid SaaS workflow tools by default.
* No paid browser automation service.
* No paid hosted vector DB.
* No paid resume builder.
* No paid proxy network.
* Local SQLite, local files, local browser profile, local UI, local scheduler, local worker pool.

## Platform Constraints

* LinkedIn and some ATS platforms may impose anti-automation limits or terms-sensitive behavior.
* The system must prefer **ATS/company-hosted execution** over platform-sensitive surfaces.
* The system must avoid aggressive crawling, account farming, background bulk actions on sensitive surfaces, and blind submit loops.
* LinkedIn is treated as a **restricted discovery/import/assist surface**, not the main execution surface.

## Truthfulness and Recruiter-Facing Output Constraints

The system must support two explicit output modes:

1. `application` — recruiter-facing and submittable.
2. `benchmark` — clearly non-submittable target-state output used only for learning and gap analysis.

### Application Mode

Application mode must remain truthful.

Allowed transformations:

* stronger phrasing,
* bullet compression,
* bullet reordering,
* relevance-focused selection,
* conservative keyword alignment,
* explicit placeholders like `[X%]` or `[X users]` only when clearly marked as pending user confirmation and blocked from submission until resolved.

Not allowed:

* invented work experience,
* invented companies,
* invented dates,
* invented tools,
* invented titles,
* invented achievements,
* invented degrees,
* invented metrics,
* invented ownership,
* invented scale.

Blocking rule:

* any claim classified as `unsupported` blocks recruiter-facing export and blocks upload eligibility.

### Benchmark Mode

Benchmark mode exists only to show what a highly competitive resume for the JD might look like so the user can study gaps and work toward them.

Allowed benchmark-only additions:

* clearly labeled sample stats,
* clearly labeled example bullets,
* clearly labeled target-skill bullets,
* clearly labeled target-state summary phrasing.

Hard rules for benchmark mode:

* every synthetic metric or claim must be explicitly labeled as example-only, such as `[SAMPLE STAT: improved render performance by 28%]`,
* benchmark artifacts must be stored with `output_mode = benchmark` and `is_submittable = false`,
* benchmark artifacts must render a visible banner such as `BENCHMARK / EXAMPLE ONLY / DO NOT SUBMIT`,
* benchmark artifacts must never be eligible for upload or submission in any execution lane,
* benchmark generation must output a gap map describing what proof, skills, and metrics the user would need to make equivalent claims truthful later.

Disallowed in benchmark mode:

* mixing real and synthetic claims without labels,
* presenting benchmark output as the user’s real background,
* silently promoting benchmark output into a live application flow.

## ATS-First Execution Constraints

Execution preference order is mandatory:

1. **API-first** when public ATS/job/application endpoints exist and are stable.
2. **Structured site adapter** when a reliable host-specific adapter exists.
3. **Browser automation fallback** when no API path exists but automation is still viable.
4. **Manual takeover** when automation risk is too high or capability is insufficient.

This preference order must be reflected in architecture, workflow states, execution policies, repo structure, milestones, and pseudocode.

## Browser Automation Constraints

* Use browser automation for **structured execution**, not uncontrolled autonomy.
* Prefer **headed** mode for real applications.
* Maintain screenshots, DOM snapshots, and step logs.
* Pause when:

  * confidence is low,
  * a captcha appears,
  * a site requires login, consent, or security actions,
  * field mapping is ambiguous,
  * a screening answer would require invention,
  * approval policy requires a submit gate.

## Anti-Fragility Constraints

* Use schema-first data contracts.
* Use site adapters and host capability profiles for known ATS types.
* Use heuristic field detection with fallbacks, not brittle selectors only.
* Save DOM snapshots and screenshots for replay and debugging.
* Support manual takeover at every stage.
* Make every queue and batch resumable.
* Keep prompts small, schema-bound, and narrow in scope.
* Do not rely on a single freeform mega-prompt for the whole system.

## Operational Guardrails

* Batch-first, queue-based operation by default.
* Auto-skip most jobs before expensive artifact generation.
* Duplicate detection before artifact generation and again before execution.
* Host-aware rate limiting and per-host concurrency limits.
* No uncontrolled LinkedIn bulk execution.
* No silent submission outside configured approval policy.
* Dry-run mode available globally.
* Model calls must validate against JSON Schema.
* All generated artifacts must be versioned and traceable to source data, decisions, and prompt versions.
* Every execution attempt must be resumable or recoverable.

## Lane-Aware Approval Constraints

Approval is lane-aware and host-aware.

Rules:

* LinkedIn restricted lane always requires stricter, per-job approval.
* Fragile or high-risk hosts require per-job approval.
* Trusted low-risk Lane 1 hosts may use per-batch artifact approval and per-batch submit approval if configured.
* New answer types require manual review before first use.
* Stable approved answers may be auto-used only when policy allows.

## LinkedIn Restricted Lane Policy

Assume LinkedIn is a **higher-risk, narrower-scope surface**.

Rules:

1. **No blind crawling of search results**

   * The user selects the jobs.
   * The system does not roam large result sets autonomously.

2. **No high-volume autonomous execution**

   * LinkedIn does not serve as the primary submit lane.
   * Jobs sourced from LinkedIn should be routed into Lane 1 when the underlying apply flow goes to a supported company/ATS target.

3. **User-initiated session only**

   * The user logs in manually in a persistent local browser profile.
   * The system uses that local session only after explicit user action.

4. **Import only what is needed**

   * Prefer extracting the selected job’s JD or asking for pasted JD text.
   * Do not scrape unrelated account or profile data.

5. **Assistive Easy Apply support only**

   * The system may help fill fields in an already-open Easy Apply flow for limited, user-initiated use.
   * It must remain lower-throughput and stricter-gated than Lane 1 execution.

6. **Always stricter approval**

   * Before opening application flow.
   * Before uploading files.
   * Before using generated answers.
   * Before any final submit action.

7. **Graceful fallback**

   * If the flow is unstable or confidence is low, switch to manual assist mode:

     * capture screenshots,
     * propose answers,
     * provide files,
     * let the user complete final steps manually.

---

# 4. Recommended Architecture

## Chosen Architecture: Hybrid Deterministic Pipeline with Lane Routing and Batch Orchestration

Use a **hybrid deterministic pipeline**:

* deterministic orchestration for workflow control,
* schema-bound LLM subroutines for extraction, scoring, wording, and validation,
* a first-class lane router,
* a persistent host capability registry,
* queue-backed schedulers and worker pools,
* API adapters,
* browser automation adapters,
* lane-aware human approval checkpoints.

This is better than a single freeform agent because it is:

* easier to test,
* cheaper to run,
* easier for Codex to build incrementally,
* easier to debug,
* safer for truthful outputs,
* more compatible with high-volume, queue-based execution.

This is better than a purely rules-only system because:

* JDs and screening questions are noisy,
* field labels vary across hosts,
* resume tailoring needs semantic compression,
* ranking benefits from constrained reasoning.

## Architectural Layers

### 1. Intake Layer

Purpose:

* ingest many jobs from pasted text, selected LinkedIn URLs, company/ATS URLs, and batch import files.

Responsibilities:

* parse batch inputs,
* create or enrich `job_posting` records,
* store raw artifacts,
* normalize URLs and hosts,
* compute hashes,
* dedupe obvious repeats,
* create a `batch_run`.

Outputs:

* `job_posting`
* `batch_run`
* initial `queue_job` records

### 2. Normalization and Extraction Layer

Purpose:

* convert raw job content into structured job data.

Responsibilities:

* HTML cleanup,
* boilerplate removal,
* text normalization,
* structured extraction,
* skill normalization,
* work-model extraction,
* external ID extraction,
* source metadata preservation.

Outputs:

* `extracted_requirements`
* normalized host metadata
* cached extraction records

### 3. Ranking and Prioritization Layer

Purpose:

* cheaply triage many jobs.

Responsibilities:

* compute fit score,
* compute execution friction,
* compute lane suitability,
* compute duplicate risk,
* compute throughput value,
* produce route and queue priority.

Outputs:

* `fit_score`
* `lane_route_decision`
* `queue_priority`
* `recommendation`

### 4. Lane Router

Purpose:

* make an explicit route decision for every job.

Responsibilities:

* classify host and apply surface,
* evaluate host capabilities,
* assign lane and execution mode,
* assign approval policy,
* assign risk tier,
* assign initial queue.

Outputs:

* `lane_route_decision`

Allowed route results:

* `linkedin_restricted`
* `ats_api_first`
* `ats_adapter_execution`
* `browser_fallback`
* `manual_only`

### 5. Host Capability Registry

Purpose:

* persist host/platform capabilities and execution behavior over time.

Responsibilities:

* record whether a host supports public job fetch,
* record whether it supports API apply,
* record adapter support,
* record browser requirement,
* record fragility score,
* record approval strictness,
* record authentication burden,
* record whether it is batch-safe,
* record success/failure history.

Outputs:

* `host_capability_profile`
* `host_health_snapshot`

### 6. Batch Orchestration Layer

Purpose:

* drive high-throughput execution safely.

Responsibilities:

* create intake batches,
* create scoring batches,
* create artifact-generation batches,
* create execution batches,
* manage retry queues,
* manage dead-letter queues,
* requeue after profile changes or artifact edits,
* pause/resume worker pools,
* enforce host buckets and cool-off windows.

Outputs:

* `batch_run`
* `queue_job`
* `retry_event`
* `dead_letter_event`

### 7. Artifact Generation Layer

Purpose:

* generate truthful artifact bundles only for top-ranked jobs.

Responsibilities:

* resume plan generation,
* tailored resume generation,
* cover letter generation when requested,
* answer-set generation,
* evidence and unsupported-claim checks,
* rendering,
* artifact bundle versioning,
* caching.

Outputs:

* `artifact_bundle`
* `tailored_resume`
* `tailored_cover_letter`
* `application_answer_set`

### 8. Approval Engine

Purpose:

* support scalable but controlled review.

Responsibilities:

* apply approval policy by lane, host, and risk,
* support per-job or per-batch approval,
* support artifact approval policies,
* support answer approval policies,
* support final submit gate policies,
* persist review decisions,
* invalidate approvals when artifacts change materially.

Outputs:

* `review_decision`
* approval statuses on jobs, artifacts, and batches

### 9. Execution Layer

Purpose:

* execute applications according to route decision and execution policy.

Responsibilities:

* API execution,
* adapter execution,
* browser execution fallback,
* per-host concurrency control,
* retry/backoff,
* upload handling,
* checkpoint enforcement,
* submission state capture,
* manual takeover handoff.

Outputs:

* `execution_attempt`
* `submission_event`
* updated `queue_job` status

### 10. Operations and Health Layer

Purpose:

* make the system operable at volume.

Responsibilities:

* queue dashboards,
* retry dashboards,
* dead-letter queues,
* host health dashboards,
* manual intervention queue,
* per-host error aggregation,
* throughput metrics,
* cost and cache metrics.

Outputs:

* `host_health_snapshot`
* local dashboards and reports

## Core Modules

### 1. Job Intake

### 2. JD Cleaner / Normalizer

### 3. JD Extraction

### 4. Job Fit Scorer

### 5. Lane Router

### 6. Host Capability Registry

### 7. Batch Scheduler

### 8. Queue Manager

### 9. Resume Tailoring Engine

### 10. Evidence Checker

### 11. Answer Library and Answer Generator

### 12. Approval Engine

### 13. API Adapters

### 14. Site Adapters

### 15. Browser Automation Executor

### 16. Submission Tracker

### 17. Retry / Dead-Letter Manager

### 18. Operations Dashboard

### 19. Host Health Monitor

### 20. Logs / Audit Trail

## Data Flow

```text
Batch Import
  -> Intake Layer
  -> JD Normalizer / Extractor
  -> Fit Scorer
  -> Lane Router
  -> [auto-skip weak or unsupported jobs]
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

## Lane-Aware State Machine

Use DB-backed explicit workflow states plus XState for interactive segments.

Primary workflow states:

* `imported`
* `normalized`
* `extracted`
* `scored`
* `routed_to_lane`
* `queued_for_artifacts`
* `artifacts_ready`
* `awaiting_batch_review`
* `approved_for_execution`
* `executing`
* `awaiting_submit_gate`
* `submitted`
* `failed`
* `dead_lettered`
* `manual_takeover`
* `linkedin_assist_only`
* `ats_api_submitted`
* `ats_browser_submitted`

Additional scheduler states:

* `queued`
* `leased`
* `paused`
* `retry_scheduled`
* `cool_off`
* `cancelled`

This state model gives deterministic progression, resumability, batch operations, and easy debugging.

---

# 5. End-to-End User Flow

## A. Batch Importing Jobs

1. User imports jobs using one or more of:

   * pasted JD text,
   * selected LinkedIn URLs,
   * company/ATS URLs,
   * a CSV or newline-delimited list.
2. App creates a `batch_run`.
3. Each imported item becomes a `job_posting`.
4. App dedupes by external job ID, canonical URL hash, and company/title similarity.
5. App queues all unique jobs for normalization and extraction.
6. App shows batch progress:

   * imported,
   * normalized,
   * extracted,
   * scored,
   * skipped,
   * routed,
   * queued for artifacts.

## B. Triaging and Routing

1. System normalizes and extracts each JD.
2. System computes fit score, lane suitability, host risk, and friction score.
3. System routes each job into one of:

   * `linkedin_restricted`
   * `ats_api_first`
   * `ats_adapter_execution`
   * `browser_fallback`
   * `manual_only`
4. Low-fit jobs are auto-skipped.
5. Top-ranked jobs are placed into the artifact queue.
6. UI shows:

   * title,
   * company,
   * source,
   * fit score,
   * lane route,
   * host type,
   * risk tier,
   * recommendation,
   * duplicate status,
   * queue priority.

## C. Lane 1 High-Volume ATS / Company Execution

1. Scheduler groups jobs by host bucket and execution mode.
2. Artifact generation runs only for the highest-priority jobs.
3. Artifact bundles are created, evidence-checked, and cached.
4. Approval engine applies policy:

   * per-job review for risky jobs,
   * per-batch review for trusted low-risk ATS flows where allowed.
5. Approved jobs move into execution queues.
6. Host bucket workers process jobs with:

   * max concurrency per host,
   * throttling,
   * backoff,
   * cool-off windows,
   * retry rules.
7. Execution prefers:

   * API submission first,
   * site adapter execution second,
   * browser fallback third.
8. Jobs either:

   * submit successfully,
   * pause for submit gate,
   * retry,
   * move to manual takeover,
   * move to dead letter.

## D. Lane 2 LinkedIn Restricted Discovery / Import / Assist

1. User selects a LinkedIn job manually.
2. App warns that LinkedIn is a restricted lane.
3. App extracts the JD or asks the user to paste JD text if extraction is blocked.
4. App scores the job and routes it.
5. If the application redirects to a company/ATS flow, the job is routed into Lane 1.
6. If the job remains a LinkedIn Easy Apply flow:

   * assist mode only,
   * no batch autonomous execution,
   * stricter approval at each risky step,
   * final submission remains manual-gated.
7. If confidence is low, switch to manual assist.

## E. Batch Review UX

The main review surface must support batches, not only single jobs.

UI sections:

* queue dashboard,
* top-ranked jobs pending artifact generation,
* artifact review batch,
* answer approval batch,
* execution-ready queue,
* retry dashboard,
* manual intervention queue,
* host health dashboard.

Batch actions:

* approve all low-risk artifact bundles in a batch,
* reject weak-fit jobs in bulk,
* approve canonical answer reuse in bulk,
* pause a host bucket,
* requeue edited jobs,
* force manual takeover for a host or job.

Per-job actions remain available.

## F. Final Submit Gates

Final submission approval is lane-aware.

### Trusted Lane 1 hosts

Allowed:

* per-batch submit approval if:

  * host is marked batch-safe,
  * risk tier is low,
  * artifact bundle is already approved,
  * answers are already approved,
  * no unresolved ambiguity exists.

### Fragile hosts and LinkedIn

Required:

* per-job submit approval,
* screenshot or live preview before submit,
* manual intervention allowed before click.

## G. Handling Failed Automation Gracefully

If execution fails:

1. Store screenshot, DOM snapshot, and error summary.
2. Record failure against host health.
3. Apply retry policy if eligible.
4. Schedule exponential backoff.
5. If retry budget is exhausted, move the job to:

   * `manual_takeover`, or
   * `dead_lettered`.
6. Preserve the artifact bundle and approval history.

The system must never lose prepared work because execution failed.

## H. Reprocessing After Profile or Artifact Changes

If the user updates the source-of-truth profile or edits a reusable answer:

1. Invalidate affected cached fit scores, answers, or artifacts.
2. Identify affected queued jobs.
3. Requeue only the necessary stages.
4. Preserve prior runs for auditability.
5. Require re-approval if recruiter-facing content materially changes.

## I. Tracking Everything Locally

The tracker should show:

* imported jobs per batch,
* skipped jobs,
* lane routes,
* host buckets,
* artifact bundle status,
* approval status,
* queue state,
* execution attempts,
* retries,
* dead-lettered jobs,
* manual intervention jobs,
* submissions,
* follow-up status.

---

# 6. MVP Scope

## What V1 Includes

### Intake and Scoring

* Batch import from pasted JD text.
* Batch import from company/ATS URLs.
* Restricted import from selected LinkedIn URLs.
* JD normalization.
* Structured JD extraction.
* Fit scoring and recommendation.
* Lane routing.
* Duplicate suppression.

### Career Knowledge Base

* Local structured master profile.
* Experience bank.
* Project bank.
* Skills taxonomy.
* Evidence items.
* Reusable answer library.

### Artifact Generation

* Batch resume planning and generation for top jobs only.
* ATS-friendly one-column resume rendering.
* Plain text export.
* HTML export.
* PDF export.
* Evidence review and unsupported-claim blocking.
* Optional cover letter generation.
* Screening answer generation and reuse.
* Artifact bundle versioning.

### Batch Review and Approval

* Batch review dashboard.
* Batch reject for weak-fit jobs.
* Batch approve low-risk artifacts on trusted hosts.
* Per-job edit and approval path.
* Answer approval flow.
* Submit-gate policies by lane and host.

### Execution

* Scheduler and queue manager.
* Host buckets.
* Per-host concurrency limits.
* Retry queue and dead-letter queue.
* API-first hooks where available.
* First-class adapter support for:

  * Greenhouse
  * Lever
* Browser fallback for selected generic forms.
* Workday assist-first mode.
* LinkedIn restricted discovery/import/assist mode.
* Dry-run mode.
* Screenshot and DOM snapshot logging.

### Tracking and Ops

* Local SQLite tracking.
* Queue dashboard.
* Retry dashboard.
* Manual intervention queue.
* Host health dashboard.
* Cost and cache metrics.

## Manual Fallback Paths in MVP

* If LinkedIn extraction fails, paste JD manually.
* If Workday is brittle, switch to manual assist mode.
* If form mapping is ambiguous, pause and show the field list.
* If upload fails, preserve artifacts for manual upload.
* If a host is unsupported, route to `manual_only`.

## Explicitly Not in MVP

* High-volume autonomous LinkedIn application execution.
* Broad LinkedIn search crawling.
* Full Workday autonomous execution.
* Email inbox parsing.
* Automatic follow-up emails.
* Interview scheduling.
* Recruiter CRM features.
* Multi-user support.
* Hosted sync.
* Proxy rotation or anti-bot evasion.
* Support for every ATS in V1.

## MVP Success Definition

MVP is successful if a user can:

1. import many jobs into a batch,
2. see extraction, fit score, and lane route for each job,
3. auto-skip weak jobs,
4. generate truthful artifact bundles for top jobs only,
5. batch-review low-risk jobs and individually review risky jobs,
6. execute supported Lane 1 ATS/company applications with queue-based host-aware scheduling,
7. use LinkedIn only for restricted discovery/import/assist,
8. recover from failures through retries, manual takeover, or dead-letter handling,
9. track the full local lifecycle end-to-end.

---

# 7. Technical Stack

## Orchestration Runtime

### Chosen

* **TypeScript + Node.js (LTS)**
* **pnpm workspace**
* **tsx** for local dev execution

### Purpose

* web API,
* workers,
* queue scheduler,
* adapters,
* CLI scripts,
* shared types.

## Browser Automation

### Chosen

* **Playwright**

### Purpose

* navigate supported sites,
* inspect forms,
* capture screenshots,
* upload files,
* run headed assist flows,
* run E2E tests.

## API Usage

### Chosen

* **OpenAI Responses API**
* structured JSON output with schema enforcement

### Purpose

* JD extraction,
* fit scoring,
* lane-aware execution planning support,
* resume wording,
* screening answer drafting,
* evidence and unsupported-claim checks.

## Schema Validation

### Chosen

* **TypeBox** + **Ajv**

### Purpose

* shared schemas,
* model output validation,
* config validation,
* queue payload validation,
* adapter contract validation.

## Local DB

### Chosen

* **SQLite** + **Drizzle ORM** + **better-sqlite3**

### Purpose

* local persistence for jobs, batches, queues, artifacts, approvals, answers, retries, host health, and tracking.

## Queueing / Scheduling / State Machine

### Chosen

* **SQLite-backed queue tables**
* **XState** for interactive and approval state machines
* **p-queue** or a thin custom worker-pool wrapper for in-process concurrency control
* workflow state persisted in SQLite

### Purpose

* batch orchestration,
* host buckets,
* fairness across hosts,
* pause/resume,
* retry scheduling,
* per-host throttling,
* per-host concurrency limits.

### Why Chosen

* no Redis required,
* local-first,
* deterministic,
* Codex-friendly,
* good enough for one-user throughput.

## Document Generation

### Chosen

* **Handlebars** for HTML/Markdown templates
* **Playwright PDF print** for PDF export
* optional **docx** package for DOCX later

## Configuration

### Chosen

* **JSONC config files**
* **.env** for secrets

### Purpose

* thresholds,
* lane routing rules,
* execution policies,
* host capability overrides,
* browser profile paths,
* logging config,
* cost caps,
* per-host concurrency.

## Logging

### Chosen

* **Pino**
* structured JSON logs
* per-batch and per-attempt logs
* DB event records

## Web UI

### Chosen

* **React + Vite**
* local API server in Node
* TanStack Query or equivalent for local data fetching
* lightweight component system

### Purpose

* batch dashboard,
* artifact review,
* queue operations,
* host health,
* manual intervention queue.

## Testing

### Chosen

* **Vitest**
* **Playwright Test**
* fixture-based regression snapshots

---

# 8. Data Model

All data is local-first and stored in SQLite plus artifact files on disk.

## Existing Core Entities

### 1. `master_profile`

Purpose:

* canonical user identity, job preferences, and default application preferences.

Important fields:

* `id`
* `profile_version`
* `full_name`
* `email`
* `phone`
* `location_city`
* `location_country`
* `linkedin_url`
* `github_url`
* `portfolio_url`
* `headline`
* `summary`
* `target_roles_json`
* `remote_preferences_json`
* `work_authorization_json`
* `salary_preferences_json`
* `notice_period_text`
* `default_resume_template_id`
* `created_at`
* `updated_at`

### 2. `experience_bank`

Purpose:

* structured factual work experiences.

Important fields:

* `id`
* `master_profile_id`
* `company_name`
* `role_title`
* `start_date`
* `end_date`
* `is_current`
* `summary`
* `responsibilities_json`
* `raw_bullets_json`
* `skills_json`
* `tools_json`
* `evidence_item_ids_json`
* `claim_confidence`
* `created_at`
* `updated_at`

### 3. `project_bank`

Purpose:

* structured factual projects.

Important fields:

* `id`
* `master_profile_id`
* `name`
* `project_type`
* `summary`
* `problem_statement`
* `actions_json`
* `outcomes_json`
* `skills_json`
* `links_json`
* `evidence_item_ids_json`
* `claim_confidence`
* `created_at`
* `updated_at`

### 4. `evidence_item`

Purpose:

* proof backing claims.

Important fields:

* `id`
* `entity_type`
* `entity_id`
* `evidence_type`
* `title`
* `description`
* `source_path_or_url`
* `metric_label`
* `metric_value_text`
* `verification_status`
* `created_at`
* `updated_at`

### 5. `job_posting`

Purpose:

* imported job source and normalized content.

New or updated fields:

* `id`
* `batch_id`
* `source_type`
* `source_url`
* `source_host`
* `external_job_id`
* `canonical_url_hash`
* `company_name`
* `job_title`
* `location_text`
* `work_model_text`
* `employment_type_text`
* `salary_text`
* `raw_html_path`
* `raw_text`
* `normalized_text`
* `content_hash`
* `import_status`
* `import_error`
* `lane_type`
* `execution_mode`
* `host_risk_tier`
* `queue_priority`
* `scheduler_status`
* `duplicate_status`
* `created_at`
* `updated_at`

### 6. `extracted_requirements`

Purpose:

* structured JD extraction output.

### 7. `fit_score`

Purpose:

* decision-ready scoring output.

New or updated fields:

* `overall_score`
* `application_friction_score`
* `resume_match_confidence_score`
* `lane_suitability_score`
* `host_execution_score`
* `recommendation`
* `missing_must_haves_json`
* `disqualifier_flags_json`
* `rationale_json`

### 8. `tailored_resume`

Purpose:

* generated resume artifacts and review status.

New or updated fields:

* `artifact_bundle_id`
* `batch_id`
* `output_mode`
* `is_submittable`
* `resume_plan_json`
* `resume_data_json`
* `benchmark_gap_map_json`
* `status`
* `approval_scope`
* `created_at`
* `updated_at`
* `approved_at`

### 9. `tailored_cover_letter`

Purpose:

* optional cover letter artifact.

### 10. `application_answer_set`

Purpose:

* screening answers for one application.

New or updated fields:

* `artifact_bundle_id`
* `batch_id`
* `review_status`
* `approval_scope`
* `created_at`
* `updated_at`
* `approved_at`

### 11. `reusable_answer_library`

Purpose:

* approved reusable answers and canonical answer metadata.

### 12. `review_decision`

Purpose:

* explicit user approvals, rejections, edits, and batch review actions.

New or updated fields:

* `scope_type` (`job`, `batch`, `artifact_bundle`, `host_bucket`)
* `approval_scope`
* `entity_type`
* `entity_id`
* `decision`
* `review_notes`
* `edited_payload_json`
* `reviewed_at`

## New Execution-Oriented Entities

### 13. `batch_run`

Purpose:

* top-level batch lifecycle.

Fields:

* `id`
* `batch_type` (`intake`, `scoring`, `artifacts`, `execution`, `retry_reprocess`)
* `status` (`created`, `running`, `paused`, `completed`, `failed`, `cancelled`)
* `source_label`
* `input_count`
* `deduped_count`
* `scored_count`
* `skipped_count`
* `artifacts_queued_count`
* `execution_ready_count`
* `submitted_count`
* `failed_count`
* `dead_letter_count`
* `created_at`
* `started_at`
* `completed_at`

### 14. `lane_route_decision`

Purpose:

* explicit routing result for a job.

Fields:

* `id`
* `job_posting_id`
* `lane_type` (`linkedin_restricted`, `ats_lane`, `manual_fallback`, `unsupported`)
* `execution_mode` (`ats_api_first`, `ats_adapter_execution`, `browser_fallback`, `manual_only`)
* `route_reason_json`
* `host_type`
* `host_risk_tier`
* `approval_scope`
* `submit_gate_required`
* `batch_safe`
* `fragility_score`
* `requires_login`
* `created_at`

### 15. `host_capability_profile`

Purpose:

* persistent capability registry per host/platform.

Fields:

* `id`
* `host`
* `site_type` (`linkedin`, `greenhouse`, `lever`, `workday`, `generic`, `custom_api`)
* `supports_public_job_fetch`
* `supports_api_apply`
* `supports_adapter_apply`
* `requires_browser`
* `fragility_score`
* `approval_strictness`
* `authentication_burden`
* `batch_safe`
* `default_max_concurrency`
* `default_rate_limit_per_minute`
* `cool_off_seconds`
* `captcha_likelihood`
* `upload_strategy`
* `notes`
* `created_at`
* `updated_at`

### 16. `execution_policy`

Purpose:

* executable policy resolved per host, lane, and risk tier.

Fields:

* `id`
* `policy_key`
* `lane_type`
* `host_risk_tier`
* `execution_mode`
* `max_concurrency`
* `rate_limit_per_minute`
* `approval_scope`
* `submit_mode` (`per_job`, `per_batch`)
* `retry_policy_json`
* `captcha_policy`
* `timeout_policy_json`
* `upload_policy`
* `answer_policy`
* `manual_takeover_threshold`
* `created_at`
* `updated_at`

### 17. `approval_policy`

Purpose:

* review and approval rules resolved for jobs or batches.

Fields:

* `id`
* `policy_key`
* `lane_type`
* `host_risk_tier`
* `artifact_review_scope`
* `answer_review_scope`
* `submit_review_scope`
* `allow_batch_artifact_approval`
* `allow_batch_submit_approval`
* `requires_manual_submit_preview`
* `requires_new_answer_review`
* `created_at`
* `updated_at`

### 18. `artifact_bundle`

Purpose:

* versioned recruiter-facing package for one job.

Fields:

* `id`
* `job_posting_id`
* `batch_id`
* `resume_id`
* `cover_letter_id`
* `answer_set_id`
* `output_mode`
* `is_submittable`
* `artifact_hash`
* `artifact_status`
* `approval_status`
* `created_at`
* `updated_at`

### 19. `queue_job`

Purpose:

* a schedulable unit of work.

Fields:

* `id`
* `batch_id`
* `job_posting_id`
* `queue_name` (`normalize`, `score`, `artifacts`, `execution`, `retry`, `manual`)
* `lane_type`
* `execution_mode`
* `queue_priority`
* `scheduler_status`
* `host_bucket`
* `lease_token`
* `lease_expires_at`
* `retry_count`
* `next_retry_at`
* `last_error_code`
* `last_error_summary`
* `artifact_bundle_id`
* `submit_gate_required`
* `created_at`
* `updated_at`

### 20. `execution_attempt`

Purpose:

* lifecycle of one execution attempt for one job.

Fields:

* `id`
* `job_posting_id`
* `artifact_bundle_id`
* `queue_job_id`
* `host`
* `host_bucket`
* `lane_type`
* `execution_mode`
* `attempt_number`
* `workflow_state`
* `current_step`
* `dry_run`
* `approval_scope`
* `started_at`
* `updated_at`
* `completed_at`
* `result` (`submitted`, `manual_completed`, `failed`, `aborted`)
* `failure_reason`
* `final_review_decision_id`

### 21. `submission_event`

Purpose:

* fine-grained audit trail for execution.

### 22. `retry_event`

Purpose:

* track retry scheduling and retry causes.

Fields:

* `id`
* `queue_job_id`
* `execution_attempt_id`
* `host`
* `retry_reason`
* `retry_count`
* `backoff_seconds`
* `scheduled_for`
* `created_at`

### 23. `dead_letter_event`

Purpose:

* record why a job left active execution.

Fields:

* `id`
* `queue_job_id`
* `job_posting_id`
* `host`
* `lane_type`
* `execution_mode`
* `reason_code`
* `reason_summary`
* `last_error_snapshot_path`
* `created_at`

### 24. `host_health_snapshot`

Purpose:

* periodic local health stats per host.

Fields:

* `id`
* `host`
* `window_start`
* `window_end`
* `attempt_count`
* `success_count`
* `failure_count`
* `retry_count`
* `dead_letter_count`
* `captcha_count`
* `median_duration_ms`
* `effective_concurrency`
* `effective_rate_limit`
* `health_status` (`healthy`, `degraded`, `paused`)
* `created_at`

### 25. `application_duplicate_index`

Purpose:

* prevent repeated applications.

## Key Relationship Notes

* one `batch_run` has many `job_posting`
* one `job_posting` has one latest `lane_route_decision`
* one `job_posting` may have many `artifact_bundle`
* one `artifact_bundle` contains one resume and optionally one cover letter and one answer set
* one `job_posting` may have many `queue_job`
* one `queue_job` may have many `execution_attempt`
* one `host_capability_profile` maps to one or more `execution_policy`
* one `execution_policy` pairs with one `approval_policy`

---

# 9. Master Career Source of Truth

The entire system is built around a structured **career knowledge base**. Recruiter-facing artifacts are assembled from facts, not freely invented per job.

## Design Principles

1. **Facts first**

   * Experiences, projects, skills, evidence, and stable answers are stored as structured records.
   * Tailoring selects and rewrites from these records.

2. **Claims must be traceable**

   * Every recruiter-facing bullet and answer must map back to one or more source units or approved placeholders.

3. **Metrics are separate from prose**

   * Metrics live in structured fields.
   * Missing metrics remain blank or become explicit placeholders requiring confirmation.

4. **Profile data is versioned**

   * Every fit score, artifact bundle, and answer set records the source profile version used.

5. **The source-of-truth is user-editable**

   * The user can refine work history, projects, metrics, links, and approved answers over time.

6. **Benchmark mode is segregated**

   * Benchmark output is a learning overlay and never mutates the factual source-of-truth.

## Work Experience Schema Principles

Each experience should include:

* company name,
* role title,
* dates,
* location,
* raw factual bullets,
* responsibilities,
* tools,
* skills,
* optional metrics,
* evidence links or notes,
* claim confidence.

Important:

* raw factual bullets stay close to truth.
* tailored bullets are generated from those facts and are not treated as new source truth.

## Project Schema Principles

Each project should include:

* name,
* type,
* role,
* dates,
* summary,
* problem,
* actions,
* outcomes,
* stack,
* links,
* evidence,
* claim confidence.

Projects are first-class evidence units and can be critical for junior or transitioning candidates.

## Skills Taxonomy

Maintain a normalized taxonomy:

* `skill_id`
* `display_name`
* `category`
* `aliases`
* `proficiency`
* `last_used_at`
* `evidence_count`

JD extraction maps raw job terms into the same taxonomy used by the profile.

## Evidence Links / Proof Notes

Evidence is internal and used to justify claims.

Verification statuses:

* `verified`
* `user_asserted`
* `inferred`
* `placeholder_required`
* `sample_example`
* `unsupported`

Export rule:

* only `verified`, `user_asserted`, `inferred`, or approved `placeholder_required` claims may appear in recruiter-facing application artifacts,
* `sample_example` may appear only in benchmark mode and must be visibly labeled.

## User-Editable Metrics and Placeholders

Metrics must remain explicit and editable.

Example:

```json
{
  "metric_label": "UI screens shipped",
  "metric_value": null,
  "unit": "screens",
  "placeholder_text": "[X screens]",
  "requires_user_confirmation": true
}
```

The system may propose placeholders. It may not silently fill them with invented values.

## Benchmark Resume Overlay

Benchmark mode should be implemented as an overlay rather than a mutation of factual records.

Suggested overlay sections:

* target-role positioning,
* target skill gaps,
* sample stat suggestions,
* example-only bullets,
* gap map from current profile to target-state profile.

Each sample stat entry should include:

* `sample_stat_text`
* `why_this_wins`
* `evidence_needed_to_make_real`
* `related_skill_ids`
* `label = SAMPLE_STAT`

## Claim Confidence Levels

Every claim should carry a confidence level:

* `verified`
* `user_asserted`
* `inferred`
* `placeholder_required`
* `sample_example`
* `unsupported`

Rules:

* `unsupported` blocks recruiter-facing export.
* `inferred` is allowed only when conservative.
* `placeholder_required` must be highlighted in review UI and resolved before submission.
* `sample_example` is benchmark-only.

---

# 10. Resume Tailoring Engine

## Overview

The Resume Tailoring Engine is a deterministic, batch-capable pipeline with constrained generation. Its job is to:

* understand a JD,
* identify the strongest truthful evidence,
* select the best experiences and projects,
* rewrite them conservatively for relevance,
* preserve ATS safety,
* block unsupported claims,
* produce a recruiter-facing artifact bundle for top jobs only,
* optionally produce a clearly non-submittable benchmark artifact.

## Batch-Aware Operating Rules

1. Do not generate resumes for all imported jobs.
2. Generate artifacts only for jobs that:

   * pass fit threshold,
   * survive duplicate checks,
   * have viable lane routing,
   * meet the current batch budget and queue capacity.
3. Cache resume plans and rendered outputs by:

   * job content hash,
   * profile version,
   * selected source unit hash,
   * output mode.
4. Reuse unchanged artifact bundles when possible.

## Output Modes

### `application` mode

Use when the artifact may be uploaded or submitted.

Rules:

* truthful only,
* ATS-safe,
* evidence-checked,
* submittable only after approval.

### `benchmark` mode

Use only for learning and aspiration.

Rules:

* visibly non-submittable,
* benchmark banner required,
* sample stats and example-only bullets allowed only when explicitly labeled,
* never uploadable,
* must include a gap map.

## Step-by-Step Logic

### 10.1 Parse the JD

Input:

* normalized JD text
* source metadata

Output:

* structured requirements

### 10.2 Normalize JD Keywords into the Taxonomy

Map raw JD terms to canonical skill IDs while preserving raw terms for ATS coverage.

### 10.3 Build Candidate Evidence Pool

Create a pool of source units:

* experience summaries,
* raw experience bullets,
* project outcomes,
* project actions,
* verified metrics,
* approved reusable profile snippets.

Each candidate unit should include:

* `source_type`
* `source_id`
* `raw_text`
* `skills_json`
* `evidence_strength`
* `recency_score`
* `seniority_relevance`
* `truth_risk`
* `metrics_available`
* `claim_confidence`

### 10.4 Score Candidate Units Against the JD

For each source unit, compute:

```text
candidate_score =
  0.35 * skill_overlap +
  0.20 * responsibility_overlap +
  0.15 * recency +
  0.10 * evidence_strength +
  0.10 * title_alignment +
  0.05 * uniqueness +
  0.05 * tooling_match
  - risk_penalties
```

Penalties:

* unsupported extrapolation,
* stale relevance,
* high placeholder burden.

### 10.5 Select Experience / Project Mix

Default one-page strategy:

* Header / contact
* Targeted summary
* Skills block
* 2–4 relevant experiences
* 1–3 relevant projects when they materially improve fit
* Education if relevant

Selection rules:

* prioritize recent relevant work,
* compress older less-relevant roles,
* avoid duplicate skill repetition,
* prefer stronger truthful evidence over weaker keyword stuffing.

### 10.6 Generate a Resume Plan Before Writing

`resume_plan` must specify:

* output mode,
* whether the artifact is submittable,
* target positioning,
* selected experiences and projects,
* section order,
* bullet counts,
* priority keywords,
* placeholders requiring confirmation,
* benchmark sample-stat plan if requested,
* warnings and gap items.

### 10.7 Rewrite Bullets Conservatively

Application-mode rewrite rules:

* preserve original meaning,
* use action + scope + result structure where supported,
* do not invent metrics or ownership,
* do not overclaim architecture scope,
* do not copy the JD verbatim,
* stay concise.

Benchmark-mode rewrite rules:

* allow clearly labeled example-only bullets and sample stats,
* every synthetic claim must map to a gap explanation.

### 10.8 Handle Missing Evidence

Application mode:

* omit unsupported claims,
* use adjacent truthful evidence,
* surface explicit placeholders when allowed,
* block submission until placeholders are resolved.

Benchmark mode:

* allow clearly labeled sample stats and target-state bullets,
* always pair with a gap explanation.

### 10.9 Constrain Resume Length

Default policy:

* one page,
* roughly 450–650 words,
* concise bullets,
* minimal redundancy.

### 10.10 Preserve ATS Readability

Rules:

* single column,
* semantic headings,
* real text,
* no tables for core content,
* no text boxes,
* no icons required for meaning,
* no sidebars.

### 10.11 Resume Linting

Before approval, run lint rules:

* page target exceeded?
* unsupported claim present?
* placeholder unresolved?
* benchmark sample content unlabeled?
* missing must-have coverage?
* repeated keyword stuffing?
* render integrity valid?

Hard failures block export.

---

# 11. Prompt System

## Prompting Philosophy

Prompts are strict subroutines inside a deterministic batch pipeline.

Rules:

* every call has a narrow purpose,
* every call uses validated JSON Schema where possible,
* temperature low by default,
* prompts do not control workflow,
* prompts do not invent facts,
* prompts must be lane-aware and batch-aware when relevant.

## Prompt Tasks

### 1. JD Extraction Prompt

Purpose:

* convert noisy JD text into structured extraction output.

### 2. Fit Scoring Prompt

Purpose:

* assess suitability against the master profile and execution reality.

It must consider:

* truthful resume match confidence,
* application friction,
* host suitability,
* whether the job is worth artifact generation.

### 3. Lane Routing Prompt or Rule-Assisted Classifier

Purpose:

* support route reasoning for ambiguous hosts or apply surfaces.

It must not override deterministic rules for known hosts. It may only assist when classification is unclear.

### 4. Resume Tailoring Prompt

Purpose:

* produce structured resume data from preselected facts.

It must be:

* schema-bound,
* conservative,
* truthful in `application` mode,
* explicitly labeled in `benchmark` mode.

### 5. Short-Answer Generation Prompt

Purpose:

* generate concise answers grounded in approved facts and reusable answers.

It must consider:

* lane,
* host type,
* answer reuse opportunities,
* whether the answer is safe to cache.

### 6. Evidence Checking Prompt

Purpose:

* map generated claims to evidence and classify support level.

### 7. Unsupported Claim Detection Prompt

Purpose:

* block unsupported claims in recruiter-facing artifacts.

### 8. Execution Planning Prompt

Purpose:

* optionally assist with difficult field mapping on browser fallback hosts.

This should only receive:

* sanitized field descriptors,
* canonical answer candidates,
* host context,
* no cookies or secrets.

## Prompt Contract Rules

1. Prompts are stored in versioned files.
2. Inputs are structured JSON.
3. Outputs are validated with Ajv.
4. Invalid outputs are retried once with validation feedback.
5. If still invalid, workflow falls back to deterministic logic or manual review.
6. Prompt versions are stored in metadata.
7. No prompt may introduce new recruiter-facing facts absent from inputs.
8. Resume and answer prompts receive only preselected facts, not full raw DB dumps.

## Prompt Runtime Policies

* Cache by input hash.
* Use smaller models for extraction, checking, and routing support.
* Use stronger models only for final wording tasks.
* Keep prompts concise and directive.
* Track token usage per batch and per job.
* Avoid expensive prompts for jobs that will be skipped.

---

# 12. Resume and Document Output Strategy

## Goals

Replace manual document editing with a deterministic, code-driven, batch-friendly output pipeline that is:

* ATS-safe,
* truthful,
* reusable,
* versionable,
* local-first,
* easy for Codex to implement.

## Canonical Artifact Flow

```text
career knowledge base
  -> resume_plan.json
  -> resume_data.json
  -> artifact_bundle
  -> ATS plain text
  -> markdown
  -> HTML
  -> PDF
  -> optional DOCX later
```

## Canonical Source for Rendering

Use `resume_data.json` as the canonical render source.

Renderers must be deterministic and must not perform hidden semantic logic.

## Output Formats

### 12.1 ATS-Safe Plain Text

Purpose:

* machine-readable canonical text,
* manual fallback copy,
* easy diffing.

### 12.2 Markdown

Purpose:

* version control,
* snapshot testing,
* debugging.

### 12.3 HTML

Purpose:

* primary styled render source for PDF.

### 12.4 PDF

Purpose:

* recruiter-facing final file for `application` mode,
* visibly watermarked study artifact for `benchmark` mode.

Requirements:

* selectable/searchable text,
* stable margins,
* no broken page flow,
* benchmark watermark and banner required.

### 12.5 Optional DOCX

Deferred unless straightforward after PDF is stable.

## Artifact Bundle Rules

Each submittable application artifact set should be stored as an `artifact_bundle` containing:

* resume,
* optional cover letter,
* answer set,
* metadata:

  * `output_mode`
  * `is_submittable`
  * `profile_version`
  * `job_hash`
  * `prompt_versions`
  * `artifact_hash`

Upload layer hard rule:

* only `artifact_bundle.output_mode = application` and `is_submittable = true` may be uploaded.

## File Naming Strategy

Use deterministic names:

```text
exports/batches/{batch_id}/{job_slug}/{artifact_bundle_id}/application-resume.pdf
exports/batches/{batch_id}/{job_slug}/{artifact_bundle_id}/application-resume.txt
exports/batches/{batch_id}/{job_slug}/{artifact_bundle_id}/application-resume.md
exports/batches/{batch_id}/{job_slug}/{artifact_bundle_id}/application-resume.html
exports/batches/{batch_id}/{job_slug}/{artifact_bundle_id}/answers.json
exports/batches/{batch_id}/{job_slug}/{artifact_bundle_id}/benchmark-resume.pdf
```

---

# 13. Browser Automation Strategy

## Core Principle

The browser layer is an **executor and fallback layer**, not the decision-maker.

It receives:

* route decision,
* execution policy,
* approved artifact bundle,
* approved answer set,
* field mapping plan,
* submit-gate policy.

It performs safe actions automatically and pauses on ambiguity or policy boundaries.

## Execution Preference Order

The system must prefer:

1. **API-first integration**
2. **structured site adapters**
3. **browser automation fallback**
4. **manual takeover**

Browser automation is therefore not the only execution path and should not be the first choice where a stable API or adapter path exists.

## Runtime Mode

Default real-application mode:

* headed Playwright,
* persistent Chromium profile,
* screenshots enabled,
* DOM snapshots enabled,
* trace capture on failure.

Default test mode:

* headless Playwright,
* fixture hosts,
* dry-run submit interception.

## Page Classification

Signals used:

* hostname,
* path patterns,
* DOM markers,
* visible labels,
* known branding,
* known field naming conventions.

Outputs:

* `site_type`
* `page_type`
* `supports_api_apply`
* `supports_adapter_apply`
* `requires_browser`
* `checkpoint_policy`
* `host_bucket`

## Field Detection

Create a `FieldDescriptor` for each input-like control.

Fields captured:

* `field_id`
* `dom_locator`
* `tag_name`
* `input_type`
* `label_text`
* `placeholder_text`
* `aria_label`
* `name_attr`
* `autocomplete_attr`
* `required`
* `options[]`
* `section_heading`
* `question_text`
* `confidence`

Canonical mapping targets remain:

* identity/contact fields,
* link fields,
* resume upload,
* cover letter upload or text,
* stable screening fields,
* custom question fallback.

Mapping method:

1. deterministic heuristics,
2. alias dictionary,
3. host-specific hints,
4. optional semantic classification for uncertain labels.

## Queue / Scheduler Design for Browser Execution

### Host Buckets

All execution jobs must be grouped into host buckets such as:

* `greenhouse`
* `lever`
* `workday`
* `linkedin`
* `generic:{domain}`

### Fairness

Scheduler rules:

* do not starve small buckets,
* do not overload fragile hosts,
* reserve slots for high-priority jobs,
* allow manual pause/resume per bucket.

### Per-Host Controls

Each host bucket applies:

* `max_concurrency`
* `rate_limit_per_minute`
* `cool_off_seconds`
* `retry_backoff_policy`
* `pause_on_captcha`
* `pause_on_degraded_health`

### Retry / Backoff

Use bounded exponential backoff with jitter.

Example policy:

* retry 1: +60s
* retry 2: +5m
* retry 3: +20m
* retry 4: dead-letter or manual takeover depending on policy

## Upload Policy

Upload rules:

* only approved `application` artifacts may be uploaded,
* benchmark artifacts are blocked at the upload layer,
* capture screenshot before and after upload,
* verify filename or upload state where possible.

## Question Answering

Question priority order:

1. approved reusable answer exact match
2. approved canonical answer by type
3. generated answer from approved facts
4. pause for manual review

Unknown long-form questions:

* propose a draft,
* require approval before insertion.

## Captchas / Blockers

On captcha or anti-bot friction:

* stop immediately,
* capture screenshot,
* notify the user,
* allow manual solve,
* resume only if policy still allows.

The executor must not attempt to defeat captchas.

## Automatic vs Approval-Required Actions

### Automatically Allowed

* open supported Lane 1 pages
* detect form fields
* fill approved identity/contact fields
* fill approved stable yes/no answers
* paste approved reusable answers
* click non-final “Next” when confidence is high and policy allows
* continue execution for per-batch-approved low-risk hosts

### Must Stop and Ask for Approval

* any new answer type
* unresolved ambiguity
* salary entry without approved policy
* work authorization ambiguity
* first upload when policy requires review
* final submit on LinkedIn
* final submit on fragile hosts
* any job marked per-job submit approval

---

# 14. Site/ATS Targeting Strategy

## Strategy Overview

Implement a **host capability registry** plus **per-site adapter interface**.

Do not assume official APIs always exist, but always prefer them when they do and when they are stable enough for local automation.

## Adapter Interface

```ts
interface ExecutionAdapter {
  id: string;
  mode: "api" | "adapter" | "browser";
  supports(host: string, context: DetectionContext): Promise<boolean>;
  detectPageType(pageOrPayload: unknown): Promise<PageType>;
  extractJob(source: unknown): Promise<NormalizedJobPayload | null>;
  extractForm?(page: Page): Promise<FormDescriptor>;
  mapFields?(form: FormDescriptor, ctx: FillContext): Promise<FieldFillPlan>;
  executeApply(input: ExecutionInput): Promise<ExecutionResult>;
  getExecutionPolicy(host: string): Promise<ResolvedExecutionPolicy>;
}
```

## Host Capability Registry Rules

Each host should record:

* `supports_public_job_fetch`
* `supports_api_apply`
* `supports_adapter_apply`
* `requires_browser`
* `fragility_score`
* `approval_strictness`
* `authentication_burden`
* `batch_safe`

The lane router uses this registry first before falling back to heuristics.

## Target Priority

Build and optimize in this order:

1. Greenhouse
2. Lever
3. generic company career sites
4. Workday assist-first
5. LinkedIn restricted import / assist

## Greenhouse

Strength:

* often structured and stable.

Policy:

* first-class MVP target,
* adapter-first execution,
* batch-safe if health remains good,
* eligible for per-batch submit approval when configured.

## Lever

Strength:

* often simpler than Workday.

Policy:

* first-class MVP target,
* adapter-first execution,
* eligible for host buckets and per-batch approvals when health remains good.

## Generic Company Career Sites

Policy:

* detect structured forms,
* use generic adapters,
* browser fallback more often,
* stricter confidence threshold than Greenhouse/Lever,
* per-job approval more common.

## Workday

Risk:

* dynamic, brittle, login-heavy, multi-step.

Policy:

* support JD import and extraction,
* support partial assist-fill,
* route most cases to `browser_fallback` or `manual_only`,
* do not promise robust high-volume autonomous execution in MVP,
* stronger approval and manual takeover defaults.

## LinkedIn

Policy:

* discovery, import, triage, routing, limited assist only,
* no high-volume autonomous execution,
* stricter approval always,
* route off-platform jobs into Lane 1 whenever possible.

---

# 15. Human-in-the-Loop Design

Human review is a first-class product feature and must be lane-aware and batch-aware.

## Approval Checkpoints

### Checkpoint 1: Artifact Review

Review:

* selected experiences/projects,
* generated bullets,
* unsupported claim warnings,
* placeholders,
* final resume preview,
* answer set preview.

Approval scope options:

* per-job,
* per-batch for trusted low-risk Lane 1 groups,
* per-host bucket for stable answer reuse.

### Checkpoint 2: Answer Review

Review:

* each new answer,
* source type,
* confidence,
* reuse status,
* whether the answer becomes reusable.

Actions:

* approve,
* edit,
* reject,
* mark reusable,
* mark always ask.

### Checkpoint 3: Upload Review

Review:

* exact artifact bundle,
* destination page or host,
* whether policy allows auto-upload after batch approval.

Hard rule:

* benchmark artifacts can never be approved for upload.

### Checkpoint 4: Submit Gate

Review:

* site,
* filled fields,
* uploaded files,
* unanswered fields,
* screenshot or live page.

Policies:

* trusted Lane 1 hosts may allow per-batch submit approval,
* fragile hosts require per-job submit approval,
* LinkedIn always requires per-job approval.

### Checkpoint 5: Low-Confidence Pause

Triggered by:

* ambiguous mapping,
* low-confidence answer,
* unusual site behavior,
* captcha,
* unsupported claim risk.

Actions:

* approve one-time usage,
* edit,
* mark always ask,
* switch to manual takeover,
* cancel.

## Batch Review UX Requirements

UI must support:

* reviewing jobs in batches,
* approving low-risk artifacts in bulk,
* rejecting weak-fit jobs in bulk,
* approving answer reuse in bulk,
* queue dashboards,
* retry dashboards,
* host health dashboards,
* manual intervention queue.

## UX Recommendations

* side-by-side review,
* diff view from factual source to generated text,
* claim badges,
* batch filters by lane, host, risk, approval state,
* keyboard shortcuts,
* inline edits,
* minimal clicks.

## Approval Persistence

Every approval or rejection must create a `review_decision` record with:

* scope,
* lane,
* host,
* artifact bundle or job ID,
* reviewer action,
* timestamp.

Approval invalidation rules:

* if recruiter-facing content changes materially,
* if profile version changes,
* if answer set changes,
* if host policy changes from low-risk to degraded.

---

# 16. Ranking and Prioritization Logic

The system protects the user’s time and token budget by triaging cheaply at scale.

## Priority Formula

Normalize all sub-scores to `0–100`.

```text
priority_score =
  0.25 * skill_match +
  0.12 * title_match +
  0.08 * seniority_match +
  0.08 * remote_preference_match +
  0.10 * stack_alignment +
  0.10 * application_friction_inverse +
  0.07 * company_desirability +
  0.05 * compensation_signal +
  0.08 * resume_match_confidence +
  0.07 * lane_suitability +
  0.08 * host_execution_value
```

Where:

* `lane_suitability` rewards jobs that can move safely into Lane 1.
* `host_execution_value` rewards jobs on stable, supported ATS/company targets and penalizes jobs requiring brittle or manual-heavy paths.

## Hard Gating Rules

Auto-recommend `skip` if any of the following is true:

* work authorization conflicts,
* must-have coverage below threshold,
* title is far outside target roles,
* role is unrelated to target domains,
* duplicate submission already exists,
* truthful resume match confidence is too low,
* host is unsupported and manual cost is too high relative to fit.

Suggested defaults:

* `must_have_coverage < 45` -> strong skip
* `priority_score < 55` -> skip
* `55–69` -> consider
* `>= 70` -> artifact candidate
* `>= 78` and stable host -> execution priority candidate

## Lane Suitability Scoring

High score when:

* job is on Greenhouse or Lever,
* host is batch-safe,
* artifacts can be generated with high confidence,
* approval path is scalable.

Lower score when:

* only LinkedIn Easy Apply is available,
* Workday is login-heavy,
* host is fragile,
* manual intervention is likely.

## Queue Priority

Queue priority is not equal to fit score.

`queue_priority` should combine:

* priority score,
* application deadline if known,
* host throughput value,
* artifact readiness,
* duplicate risk,
* current host congestion.

This lets the scheduler process the best jobs first without overloading a fragile host.

---

# 17. Answer Library and Reuse

## Goal

Avoid re-answering the same screening questions while keeping reuse truthful, reviewable, and scalable.

## Canonical Question Types

Examples:

* work authorization
* visa sponsorship
* salary expectations
* notice period
* location
* remote preference
* willing to relocate
* years of experience
* why this company
* why this role
* availability
* portfolio links
* GitHub links

Sensitive self-ID flows should remain manual when ambiguous.

## Library Record Structure

Each entry should store:

* canonical question key,
* variant phrasings,
* approved default answer,
* structured value if applicable,
* scope,
* freshness requirement,
* auto-use policy,
* host restrictions,
* last reviewed timestamp.

## Reuse Rules

### Auto Reuse Allowed

Only for stable factual answers the user approved:

* work authorization
* sponsorship need
* contact info
* portfolio links
* general remote preference
* notice period when current

### Suggest Reuse

For answers that often need updates:

* years of experience
* salary expectation
* start date availability

### Manual Only

For company-specific motivation:

* why this company
* why this role
* why this team
* product interest questions

## Batch Efficiency Rules

* cache answer sets by normalized question key + job/company context hash + profile version
* allow batch approval of reused stable answers on trusted hosts
* require per-answer review for new long-form answers

## Safety Rules

* never auto-answer unsupported credentials,
* never inflate years of experience,
* never auto-fill salary numbers without approved policy,
* do not auto-write motivational answers without review.

---

# 18. Security and Privacy

## Core Principles

* local-first storage,
* minimal data retention,
* log redaction,
* no cookie or password exposure to the LLM,
* no unnecessary raw HTML sent to model calls.

## Secrets

Store OpenAI API key in:

* `.env` for MVP,
* optional OS keychain integration later.

## Browser Session Data

Use a local persistent browser profile directory.

Rules:

* user logs in manually,
* passwords are never captured programmatically,
* cookies remain in the browser profile,
* cookies are never stored in DB or sent to OpenAI.

## Personal Data

Stored locally:

* contact details,
* work history,
* projects,
* evidence,
* approved answers,
* artifacts,
* application history.

Rules:

* send only necessary profile fields to prompts,
* redact unrelated personal content from logs and snapshots,
* allow the user to purge local data.

## Logs

Redact:

* API keys,
* cookies,
* tokens,
* passwords,
* full phone numbers when unnecessary,
* full email text if ever stored.

Keep:

* event types,
* hostnames,
* step labels,
* error codes,
* redacted payload summaries,
* artifact paths.

## Screenshot and Snapshot Retention

Default:

* recent runs retained,
* older runs purgeable by script,
* host health stats preserved in aggregate.

## Data Minimization for Model Calls

* send only selected source units,
* do not send raw browser sessions,
* prefer extracted fields to raw DOM,
* avoid large payloads for skipped jobs.

---

# 19. Failure Modes and Recovery

## 1. JD Extraction Failure

Recovery:

* retry once,
* fallback to manual JD cleanup,
* keep the batch moving.

## 2. Lane Routing Ambiguity

Recovery:

* use deterministic fallback rules,
* default to safer route,
* mark job for manual classification if needed.

## 3. Artifact Generation Failure

Recovery:

* retry once,
* keep prior valid artifacts,
* mark job for review if repeated failure persists.

## 4. Unsupported Claim Detected

Recovery:

* block recruiter-facing export,
* show offending claim,
* require edit, removal, or placeholder resolution.

## 5. Broken Adapter or Selector Drift

Recovery:

* re-run detection,
* fallback to generic extraction,
* fallback to browser assist,
* record host degradation,
* lower host health.

## 6. Login or Session Expiry

Recovery:

* pause host bucket,
* ask user to re-authenticate manually,
* resume leased jobs after login.

## 7. Upload Failure

Recovery:

* retry once,
* verify artifact path,
* allow manual upload,
* keep execution state live.

## 8. Captcha / Anti-Bot Friction

Recovery:

* stop immediately,
* pause or cool off host bucket,
* allow manual solve,
* resume only if policy permits.

## 9. Retry Storm Risk

Recovery:

* cap retries,
* enforce exponential backoff,
* degrade host health,
* pause bucket if failure spike exceeds threshold.

## 10. Unsupported or Hostile Form

Recovery:

* route to `manual_only`,
* preserve artifact bundle,
* record reason in dead-letter or manual queue.

## 11. Duplicate Application Risk

Recovery:

* warn and block execution by default,
* allow explicit override only with user note.

## 12. Browser Crash / Process Kill

Recovery:

* persist state,
* release leases,
* relaunch worker,
* resume from last safe checkpoint.

## 13. Queue Lease Expiry

Recovery:

* detect stale lease,
* requeue job,
* increment lease-recovery metric,
* avoid double submission by checking final state before rerun.

## 14. Dead Letter Handling

A job is dead-lettered when:

* retry budget is exhausted,
* host is degraded and unsafe,
* output remains blocked,
* manual takeover is required but declined.

The dead-letter queue must preserve:

* route decision,
* host info,
* last error,
* artifact status,
* retry history,
* recommended next action.

---

# 20. Testing Strategy

Testing must be built alongside the system and must be lane-aware.

## 20.1 Unit Tests

Cover:

* normalization,
* skill taxonomy matching,
* fit scoring,
* lane routing,
* queue priority,
* duplicate detection,
* answer library matching,
* config validation,
* policy resolution,
* retry/backoff calculations.

## 20.2 Schema Validation Tests

For every schema:

* valid fixture passes,
* invalid fixture fails,
* enums and required fields enforced,
* extra property policy behaves correctly.

Must cover:

* job extraction,
* fit scoring,
* lane route decision,
* queue job,
* batch run,
* execution policy,
* host capability profile,
* resume plan,
* screening answer,
* review decision.

## 20.3 Queue and Scheduler Tests

Must cover:

* lease acquisition,
* lease expiry recovery,
* pause/resume,
* host fairness,
* host bucket concurrency,
* rate limiting,
* cool-off windows,
* retry scheduling,
* dead-letter behavior.

## 20.4 Lane Routing Tests

Must cover:

* LinkedIn restricted-lane policy,
* ATS API-first routing,
* adapter routing,
* browser fallback routing,
* manual-only routing,
* host override behavior.

## 20.5 Batch Approval Tests

Must cover:

* per-batch artifact approval,
* per-job override,
* approval invalidation after edits,
* submit-gate rules by lane and host,
* LinkedIn stricter approval enforcement.

## 20.6 Prompt Contract Tests

Must cover:

* prompt input shape,
* schema validation of outputs,
* invalid-output retry behavior,
* fallback when prompt output remains invalid.

## 20.7 API Adapter Tests

Must cover:

* request shaping,
* response parsing,
* failure handling,
* authentication or missing-capability fallbacks.

## 20.8 Browser Fallback Tests

Must cover:

* generic field detection,
* mapping,
* upload checkpoint,
* final submit gate,
* manual takeover branch.

## 20.9 Mock Form Pages

Create fixture pages for:

* Greenhouse-like form
* Lever-like form
* generic company form
* Workday-like multi-step flow
* LinkedIn-like modal assist flow
* API-emulated host

## 20.10 End-to-End Tests

E2E suites should cover:

1. batch import -> normalize -> extract -> score -> route
2. top-job artifact generation
3. batch review and approval
4. Lane 1 execution on supported hosts in dry-run
5. retry path after controlled failure
6. dead-lettering after exhausted retries
7. LinkedIn restricted assist flow
8. manual takeover path
9. reprocessing after profile edit

## 20.11 Dry-Run Mode

Global dry-run must:

* perform all non-final steps,
* intercept final submit,
* still record screenshots and events,
* report “would have submitted”.

---

# 21. Evaluation Metrics

## Batch Throughput Metrics

* jobs imported per batch
* jobs normalized per batch
* jobs triaged per batch
* jobs skipped per batch
* jobs routed per lane per batch
* applications prepared per batch
* applications submitted per batch

## Lane-Aware Metrics

* submit success rate by host
* submit success rate by lane
* median time per application by lane
* manual intervention rate by lane
* batch approval rate
* per-job approval rate
* LinkedIn assist completion rate
* Lane 1 throughput rate

## Queue and Reliability Metrics

* queue depth by stage
* queue wait time
* worker utilization
* retries per host
* dead-letter rate
* cool-off frequency by host
* host degradation events
* lease recovery count

## Artifact Quality Metrics

* recruiter-facing artifact approval rate
* unsupported-claim rate
* placeholder resolution rate
* answer reuse rate
* answer edit rate
* resume edit rate after generation

## Triage Quality Metrics

* user accept rate for jobs scored `apply`
* override rate for jobs scored `skip`
* duplicate prevention count
* cost per retained high-fit job

## Ops Metrics

* host health score trend
* cache hit rate
* token cost per batch
* token cost per submitted application
* browser-fallback usage rate
* API-first usage rate

---

# 22. Cost Model

## Cost Philosophy

Most imported jobs should be rejected cheaply.

Only higher-fit jobs should consume artifact-generation cost.

Execution should prefer the cheapest reliable route:

1. API-first where available,
2. adapter execution second,
3. browser fallback only when needed,
4. manual takeover last.

## Lane-Aware Cost Stages

### Stage 1: Cheap Triage at Scale

Calls:

* JD extraction
* fit scoring
* lane routing support only when needed

Goal:

* low cost per imported job

### Stage 2: Artifact Cost for Top Jobs Only

Calls:

* resume plan
* resume wording
* evidence check
* unsupported-claim check
* answer generation only when reuse fails

Only run if:

* fit threshold passes,
* lane is viable,
* duplicate risk is acceptable,
* job enters top-ranked artifact queue.

### Stage 3: Execution Cost

Most execution cost is local machine time.

Browser-heavy cost is operational fragility, not API spend.

API-first and adapter-first paths reduce execution fragility cost and operator time.

## Batch Efficiency Rules

* cache JD extraction by normalized JD hash
* cache fit scoring by `(job hash + profile version)`
* cache answers by `(canonical question + context hash + profile version)`
* cache rendered artifacts by `(job hash + source-unit hash + profile version + output mode)`
* reuse stable approved answers in bulk
* do not generate artifacts for skipped jobs
* do not generate cover letters by default
* do not generate long-form answers unless needed

## Example Config

```json
{
  "costControls": {
    "enableCaching": true,
    "skipCoverLetterByDefault": true,
    "onlyGenerateArtifactsForTopPercent": 20,
    "onlyGenerateAnswersOnDemand": true,
    "monthlySoftUsdCap": 10
  }
}
```

---

# 23. Repo Structure

Use a pnpm workspace monorepo.

```text
/
├─ plan.md
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
├─ .env.example
├─ .gitignore
├─ config/
│  ├─ default.jsonc
│  ├─ host-capabilities.jsonc
│  ├─ execution-policies.jsonc
│  ├─ approval-policies.jsonc
│  └─ schemas/
│     └─ app-config.schema.json
├─ apps/
│  ├─ web/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ main.tsx
│  │     ├─ pages/
│  │     │  ├─ batches/
│  │     │  ├─ jobs/
│  │     │  ├─ review/
│  │     │  ├─ queues/
│  │     │  ├─ hosts/
│  │     │  └─ settings/
│  │     ├─ components/
│  │     ├─ hooks/
│  │     ├─ state/
│  │     └─ api/
│  └─ worker/
│     ├─ package.json
│     └─ src/
│        ├─ index.ts
│        ├─ cli.ts
│        ├─ scheduler/
│        ├─ workers/
│        ├─ queues/
│        ├─ workflows/
│        └─ runbooks/
├─ packages/
│  ├─ core/
│  │  └─ src/
│  │     ├─ normalization/
│  │     ├─ taxonomy/
│  │     ├─ scoring/
│  │     ├─ routing/
│  │     ├─ policies/
│  │     ├─ retry/
│  │     ├─ resume/
│  │     ├─ answers/
│  │     ├─ evidence/
│  │     └─ utils/
│  ├─ db/
│  │  └─ src/
│  │     ├─ client.ts
│  │     ├─ schema.ts
│  │     ├─ migrations/
│  │     ├─ repos/
│  │     └─ seeds/
│  ├─ schemas/
│  │  └─ src/
│  │     ├─ job-extraction.ts
│  │     ├─ fit-scoring.ts
│  │     ├─ lane-route-decision.ts
│  │     ├─ queue-job.ts
│  │     ├─ batch-run.ts
│  │     ├─ execution-policy.ts
│  │     ├─ host-capability-profile.ts
│  │     ├─ resume-plan.ts
│  │     ├─ tailored-resume.ts
│  │     ├─ screening-answer.ts
│  │     └─ review-decision.ts
│  ├─ prompts/
│  │  └─ src/
│  │     ├─ jd-extraction.md
│  │     ├─ fit-scoring.md
│  │     ├─ lane-routing.md
│  │     ├─ resume-tailoring.md
│  │     ├─ short-answer.md
│  │     ├─ evidence-check.md
│  │     ├─ unsupported-claim-check.md
│  │     └─ execution-planning.md
│  ├─ llm/
│  │  └─ src/
│  │     ├─ client.ts
│  │     ├─ cache.ts
│  │     ├─ retry.ts
│  │     └─ tasks/
│  │        ├─ extract-job.ts
│  │        ├─ score-fit.ts
│  │        ├─ route-lane.ts
│  │        ├─ tailor-resume.ts
│  │        ├─ generate-answer.ts
│  │        ├─ evidence-check.ts
│  │        └─ execution-plan.ts
│  ├─ registry/
│  │  └─ src/
│  │     ├─ host-capabilities.ts
│  │     ├─ execution-policies.ts
│  │     └─ approval-policies.ts
│  ├─ scheduler/
│  │  └─ src/
│  │     ├─ queue-manager.ts
│  │     ├─ lease-manager.ts
│  │     ├─ host-buckets.ts
│  │     ├─ fairness.ts
│  │     ├─ retry-queue.ts
│  │     ├─ dead-letter.ts
│  │     └─ metrics.ts
│  ├─ renderer/
│  │  └─ src/
│  │     ├─ templates/
│  │     ├─ render-markdown.ts
│  │     ├─ render-text.ts
│  │     ├─ render-html.ts
│  │     ├─ render-pdf.ts
│  │     └─ render-docx.ts
│  ├─ browser/
│  │  └─ src/
│  │     ├─ launch.ts
│  │     ├─ detectors/
│  │     ├─ fields/
│  │     ├─ checkpoints/
│  │     ├─ snapshots/
│  │     └─ types.ts
│  ├─ adapters/
│  │  └─ src/
│  │     ├─ api/
│  │     ├─ greenhouse/
│  │     ├─ lever/
│  │     ├─ workday/
│  │     ├─ linkedin/
│  │     └─ generic/
│  ├─ workflows/
│  │  └─ src/
│  │     ├─ batch-import.ts
│  │     ├─ process-job.ts
│  │     ├─ route-job.ts
│  │     ├─ schedule-artifacts.ts
│  │     ├─ execute-batch.ts
│  │     ├─ retry-failed.ts
│  │     └─ state-machines/
│  ├─ ops/
│  │  └─ src/
│  │     ├─ host-health.ts
│  │     ├─ dashboards.ts
│  │     └─ reports.ts
│  └─ shared-ui/
│     └─ src/
│        ├─ status-badges/
│        ├─ diff-view/
│        ├─ batch-review/
│        ├─ queue-panels/
│        └─ host-health/
├─ data/
│  ├─ profiles/
│  ├─ exports/
│  ├─ raw/
│  ├─ screenshots/
│  ├─ traces/
│  ├─ logs/
│  └─ host-health/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  ├─ e2e/
│  ├─ fixtures/
│  │  ├─ jobs/
│  │  ├─ profiles/
│  │  ├─ model-outputs/
│  │  ├─ forms/
│  │  └─ hosts/
│  └─ snapshots/
├─ docs/
│  ├─ architecture.md
│  ├─ runbooks/
│  ├─ host-notes/
│  └─ policies/
└─ scripts/
   ├─ setup.ts
   ├─ seed.ts
   ├─ import-profile.ts
   ├─ migrate.ts
   ├─ requeue-batch.ts
   ├─ recompute-host-health.ts
   └─ purge-old-artifacts.ts
```

---

# 24. Milestone Plan

## Phase 0: Foundations

### Deliverables

* workspace scaffold
* config system
* schemas package
* DB schema
* host capability registry config
* execution policy config
* approval policy config
* mock data and fixtures

### Acceptance Criteria

* repo boots locally
* config validates
* migrations run
* fixture seed works

---

## Phase 1: Batch Intake, Extraction, Scoring, Routing

### Deliverables

* batch import
* dedupe
* JD normalization
* extraction task
* fit scoring task
* lane router
* queue priority calculation
* intake and triage UI

### Acceptance Criteria

* user can import many jobs
* jobs normalize and score in batch
* each job gets a lane route
* weak jobs auto-skip
* results persist locally

---

## Phase 2: Core Scheduler and Queue Management

### Deliverables

* queue tables
* lease manager
* scheduler
* host buckets
* fairness logic
* retry queue
* dead-letter queue
* pause/resume controls

### Acceptance Criteria

* jobs can be queued and leased
* host-specific concurrency is enforced
* retries and dead letters work
* queue state survives restart

---

## Phase 3: Source-of-Truth Profile and Artifact Generation

### Deliverables

* master profile import/edit
* experience/project banks
* evidence items
* artifact bundle model
* resume planning
* resume rendering
* evidence and unsupported-claim checks
* answer library and answer generation

### Acceptance Criteria

* top jobs generate truthful artifact bundles
* unsupported claims block export
* answers are reusable and reviewable

---

## Phase 4: Batch Review and Approval UX

### Deliverables

* batch review dashboard
* artifact review UI
* answer review UI
* per-job and per-batch approval flows
* approval persistence
* approval invalidation rules

### Acceptance Criteria

* user can batch-approve low-risk artifacts
* user can individually review risky jobs
* policies differ by lane and host

---

## Phase 5: Lane 1 Execution Adapters

### Deliverables

* API-first hook points
* Greenhouse adapter
* Lever adapter
* generic company form support
* upload handling
* submit gates
* execution attempt tracking

### Acceptance Criteria

* supported Lane 1 targets execute end-to-end in dry-run
* host policies are enforced
* queue throughput is measurable

---

## Phase 6: Browser Fallback and Workday Assist

### Deliverables

* browser fallback runtime
* generic field extraction
* Workday assist-first flow
* manual takeover queue
* improved snapshots and traces

### Acceptance Criteria

* fallback path works when no first-class adapter exists
* Workday can be assisted without claiming full automation

---

## Phase 7: LinkedIn Restricted Discovery / Import / Assist

### Deliverables

* LinkedIn import flow
* restricted-lane warnings
* Easy Apply limited assist
* routing from LinkedIn into Lane 1 where possible
* stricter submit gates

### Acceptance Criteria

* LinkedIn jobs can be imported and triaged
* Easy Apply assist remains constrained
* no high-volume autonomous LinkedIn execution path exists

---

## Phase 8: Reliability, Ops, and Hardening

### Deliverables

* host health metrics
* retry dashboards
* dead-letter dashboard
* cost dashboard
* host pause/cool-off controls
* runbooks
* regression stabilization

### Acceptance Criteria

* failures are inspectable
* hosts can be paused and resumed
* retries and dead letters are visible
* docs support local operation

---

# 25. Codex Build Order

Codex should implement in this exact order.

## Step 1: Workspace and Base Config

Create:

* workspace files
* JSONC config
* policy configs
* environment setup

## Step 2: Shared Schemas Package

Implement schemas for:

* job extraction
* fit scoring
* lane route decision
* queue job
* batch run
* execution policy
* host capability profile
* resume plan
* screening answer
* review decision

## Step 3: DB Package

Implement tables and repos for:

* core profile and job tables
* batch_run
* lane_route_decision
* host_capability_profile
* execution_policy
* approval_policy
* artifact_bundle
* queue_job
* execution_attempt
* retry_event
* dead_letter_event
* host_health_snapshot

## Step 4: Core Deterministic Logic

Implement:

* normalization
* taxonomy matching
* fit formula
* lane routing rules
* queue priority logic
* duplicate detection
* retry/backoff helpers

## Step 5: Registry and Policy Resolution

Implement:

* host registry loaders
* execution policy resolution
* approval policy resolution
* host bucket derivation

## Step 6: LLM Wrapper Package

Implement:

* Responses API client wrapper
* schema validation
* caching
* retry
* task wrappers

## Step 7: Prompt Files and Job Analysis Tasks

Implement:

* JD extraction
* fit scoring
* optional lane routing support
* evidence check
* answer generation

## Step 8: Batch Intake Workflow

Implement:

* batch import
* normalize -> extract -> score -> route
* initial queue insertion
* triage UI API

## Step 9: Scheduler and Queue Manager

Implement:

* lease acquisition
* host buckets
* fairness
* pause/resume
* retry queue
* dead-letter queue

## Step 10: Profile Import and Artifact Bundle Generation

Implement:

* profile import/edit
* resume plan
* resume generation
* answer set generation
* artifact bundle creation
* renderers
* claim checks

## Step 11: Batch Review and Approval Engine

Implement:

* batch review UI
* per-job review UI
* approval persistence
* approval invalidation
* submit-gate resolution

## Step 12: Execution Runtime Base

Implement:

* execution workflow
* execution attempts
* submission events
* dry-run
* screenshots and DOM snapshots

## Step 13: Lane 1 Adapters

Implement in order:

1. Greenhouse
2. Lever
3. generic company fallback

## Step 14: Browser Fallback and Manual Takeover

Implement:

* generic field extraction
* checkpoint handling
* manual takeover queue

## Step 15: Workday Assist-First

Implement limited support only after the above is stable.

## Step 16: LinkedIn Restricted Lane

Implement last among real targets.

It must remain:

* discovery/import/assist only,
* not the main high-volume execution lane.

## Step 17: Ops Dashboards and Host Health

Implement:

* queue dashboards
* retry dashboards
* dead-letter view
* host health view
* cost metrics

## Step 18: Runbooks and Hardening

Implement:

* setup docs
* safe operation docs
* adapter authoring guide
* troubleshooting runbooks

---

# 26. Definition of Done

MVP is complete only when all of the following are true.

## Functional Requirements

* user can import jobs in batch
* system normalizes, extracts, scores, and routes each job
* weak jobs are auto-skipped
* top jobs get truthful artifact bundles
* system supports batch review and per-job review
* system supports Lane 1 execution on first-class targets
* system supports browser fallback where needed
* system supports LinkedIn restricted discovery/import/assist
* system tracks retries, dead letters, manual takeovers, and outcomes locally

## UX Requirements

* queue dashboard is usable
* batch review is fast
* approvals are explicit and persisted
* failures are understandable
* manual takeover is graceful
* host health is visible

## Reliability Requirements

* schema validation exists for all model outputs
* queue state survives restart
* retries and dead letters work
* dry-run prevents unintended submission
* host throttling and concurrency controls are enforced
* tests cover core lanes and queues

## Truthfulness Requirements

* no unsupported claims in approved recruiter-facing artifacts
* benchmark output is visibly labeled and non-submittable
* placeholders are explicit and resolved before submission
* answer generation does not invent credentials or eligibility

## Architectural Requirements

* Lane 1 is ATS/company high-volume execution
* Lane 2 is LinkedIn restricted discovery/import/assist
* API-first / adapter-second / browser-third / manual-last is implemented in code structure and flow
* scheduler, lane router, host registry, execution policies, approval policies, and ops dashboards all exist

---

# 27. Appendix A: Exact JSON Schemas

## A.1 Job Extraction Output

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "job-extraction-output.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "job_title",
    "company_name",
    "seniority_level",
    "employment_type",
    "remote_expectation",
    "must_have_skills",
    "nice_to_have_skills",
    "responsibilities",
    "keywords",
    "tools",
    "location_constraints",
    "work_auth_requirements",
    "red_flags",
    "parse_confidence"
  ],
  "properties": {
    "job_title": { "type": "string" },
    "company_name": { "type": "string" },
    "seniority_level": {
      "type": "string",
      "enum": ["intern", "junior", "mid", "senior", "staff_plus", "unknown"]
    },
    "employment_type": {
      "type": "string",
      "enum": ["full_time", "part_time", "contract", "internship", "unknown"]
    },
    "remote_expectation": {
      "type": "string",
      "enum": ["remote", "hybrid", "onsite", "unknown"]
    },
    "must_have_skills": {
      "type": "array",
      "items": { "$ref": "#/$defs/skillItem" }
    },
    "nice_to_have_skills": {
      "type": "array",
      "items": { "$ref": "#/$defs/skillItem" }
    },
    "responsibilities": {
      "type": "array",
      "items": { "type": "string" }
    },
    "keywords": {
      "type": "array",
      "items": { "type": "string" }
    },
    "tools": {
      "type": "array",
      "items": { "type": "string" }
    },
    "location_constraints": {
      "type": "array",
      "items": { "type": "string" }
    },
    "work_auth_requirements": {
      "type": "array",
      "items": { "type": "string" }
    },
    "compensation_signals": {
      "type": "array",
      "items": { "type": "string" }
    },
    "domain_signals": {
      "type": "array",
      "items": { "type": "string" }
    },
    "education_requirements": {
      "type": "array",
      "items": { "type": "string" }
    },
    "red_flags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "parse_confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    }
  },
  "$defs": {
    "skillItem": {
      "type": "object",
      "additionalProperties": false,
      "required": ["raw_term", "normalized_skill_id", "importance"],
      "properties": {
        "raw_term": { "type": "string" },
        "normalized_skill_id": { "type": "string" },
        "importance": {
          "type": "string",
          "enum": ["must_have", "preferred", "contextual"]
        }
      }
    }
  }
}
```

## A.2 Fit Scoring Output

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "fit-scoring-output.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "overall_score",
    "skill_match_score",
    "title_match_score",
    "seniority_match_score",
    "remote_match_score",
    "stack_alignment_score",
    "application_friction_score",
    "resume_match_confidence_score",
    "lane_suitability_score",
    "host_execution_score",
    "matched_strengths",
    "missing_must_haves",
    "disqualifier_flags",
    "recommendation",
    "reasoning"
  ],
  "properties": {
    "overall_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "skill_match_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "title_match_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "seniority_match_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "remote_match_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "stack_alignment_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "application_friction_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "resume_match_confidence_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "lane_suitability_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "host_execution_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "matched_strengths": {
      "type": "array",
      "items": { "type": "string" }
    },
    "missing_must_haves": {
      "type": "array",
      "items": { "type": "string" }
    },
    "disqualifier_flags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "recommendation": {
      "type": "string",
      "enum": ["apply", "consider", "skip"]
    },
    "reasoning": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

## A.3 Lane Route Decision

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "lane-route-decision.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "lane_type",
    "execution_mode",
    "host_type",
    "host_risk_tier",
    "approval_scope",
    "submit_gate_required",
    "batch_safe",
    "fragility_score",
    "reasoning"
  ],
  "properties": {
    "lane_type": {
      "type": "string",
      "enum": ["linkedin_restricted", "ats_lane", "manual_fallback", "unsupported"]
    },
    "execution_mode": {
      "type": "string",
      "enum": ["ats_api_first", "ats_adapter_execution", "browser_fallback", "manual_only"]
    },
    "host_type": {
      "type": "string",
      "enum": ["linkedin", "greenhouse", "lever", "workday", "generic", "custom_api", "unknown"]
    },
    "host_risk_tier": {
      "type": "string",
      "enum": ["low", "medium", "high"]
    },
    "approval_scope": {
      "type": "string",
      "enum": ["per_job", "per_batch"]
    },
    "submit_gate_required": { "type": "boolean" },
    "batch_safe": { "type": "boolean" },
    "fragility_score": { "type": "number", "minimum": 0, "maximum": 1 },
    "reasoning": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

## A.4 Host Capability Profile

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "host-capability-profile.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "host",
    "site_type",
    "supports_public_job_fetch",
    "supports_api_apply",
    "supports_adapter_apply",
    "requires_browser",
    "fragility_score",
    "approval_strictness",
    "authentication_burden",
    "batch_safe",
    "default_max_concurrency",
    "default_rate_limit_per_minute",
    "cool_off_seconds"
  ],
  "properties": {
    "host": { "type": "string" },
    "site_type": {
      "type": "string",
      "enum": ["linkedin", "greenhouse", "lever", "workday", "generic", "custom_api"]
    },
    "supports_public_job_fetch": { "type": "boolean" },
    "supports_api_apply": { "type": "boolean" },
    "supports_adapter_apply": { "type": "boolean" },
    "requires_browser": { "type": "boolean" },
    "fragility_score": { "type": "number", "minimum": 0, "maximum": 1 },
    "approval_strictness": {
      "type": "string",
      "enum": ["low", "medium", "high"]
    },
    "authentication_burden": {
      "type": "string",
      "enum": ["none", "low", "medium", "high"]
    },
    "batch_safe": { "type": "boolean" },
    "default_max_concurrency": { "type": "integer", "minimum": 1, "maximum": 10 },
    "default_rate_limit_per_minute": { "type": "integer", "minimum": 1, "maximum": 120 },
    "cool_off_seconds": { "type": "integer", "minimum": 0 },
    "captcha_likelihood": { "type": "number", "minimum": 0, "maximum": 1 },
    "upload_strategy": {
      "type": "string",
      "enum": ["standard", "delayed", "manual_review", "unsupported"]
    },
    "notes": { "type": "string" }
  }
}
```

## A.5 Execution Policy

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "execution-policy.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "policy_key",
    "lane_type",
    "host_risk_tier",
    "execution_mode",
    "max_concurrency",
    "rate_limit_per_minute",
    "approval_scope",
    "submit_mode",
    "retry_policy",
    "captcha_policy",
    "timeout_policy",
    "upload_policy"
  ],
  "properties": {
    "policy_key": { "type": "string" },
    "lane_type": {
      "type": "string",
      "enum": ["linkedin_restricted", "ats_lane", "manual_fallback", "unsupported"]
    },
    "host_risk_tier": {
      "type": "string",
      "enum": ["low", "medium", "high"]
    },
    "execution_mode": {
      "type": "string",
      "enum": ["ats_api_first", "ats_adapter_execution", "browser_fallback", "manual_only"]
    },
    "max_concurrency": { "type": "integer", "minimum": 1, "maximum": 10 },
    "rate_limit_per_minute": { "type": "integer", "minimum": 1, "maximum": 120 },
    "approval_scope": {
      "type": "string",
      "enum": ["per_job", "per_batch"]
    },
    "submit_mode": {
      "type": "string",
      "enum": ["per_job", "per_batch"]
    },
    "retry_policy": {
      "type": "object",
      "additionalProperties": false,
      "required": ["max_retries", "backoff_seconds"],
      "properties": {
        "max_retries": { "type": "integer", "minimum": 0, "maximum": 10 },
        "backoff_seconds": {
          "type": "array",
          "items": { "type": "integer", "minimum": 1 }
        }
      }
    },
    "captcha_policy": {
      "type": "string",
      "enum": ["pause_and_wait", "manual_takeover", "dead_letter"]
    },
    "timeout_policy": {
      "type": "object",
      "additionalProperties": false,
      "required": ["page_load_ms", "step_ms"],
      "properties": {
        "page_load_ms": { "type": "integer", "minimum": 1000 },
        "step_ms": { "type": "integer", "minimum": 1000 }
      }
    },
    "upload_policy": {
      "type": "string",
      "enum": ["auto_if_approved", "review_required", "manual_only"]
    }
  }
}
```

## A.6 Queue Job

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "queue-job.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "batch_id",
    "job_posting_id",
    "queue_name",
    "lane_type",
    "execution_mode",
    "queue_priority",
    "scheduler_status",
    "host_bucket",
    "retry_count"
  ],
  "properties": {
    "batch_id": { "type": "string" },
    "job_posting_id": { "type": "string" },
    "queue_name": {
      "type": "string",
      "enum": ["normalize", "score", "artifacts", "execution", "retry", "manual"]
    },
    "lane_type": {
      "type": "string",
      "enum": ["linkedin_restricted", "ats_lane", "manual_fallback", "unsupported"]
    },
    "execution_mode": {
      "type": "string",
      "enum": ["ats_api_first", "ats_adapter_execution", "browser_fallback", "manual_only"]
    },
    "queue_priority": { "type": "integer", "minimum": 0, "maximum": 1000 },
    "scheduler_status": {
      "type": "string",
      "enum": ["queued", "leased", "running", "paused", "retry_scheduled", "dead_lettered", "completed", "cancelled"]
    },
    "host_bucket": { "type": "string" },
    "retry_count": { "type": "integer", "minimum": 0 },
    "next_retry_at": { "type": ["string", "null"], "format": "date-time" },
    "artifact_bundle_id": { "type": ["string", "null"] },
    "submit_gate_required": { "type": "boolean" }
  }
}
```

## A.7 Batch Run

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "batch-run.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "batch_type",
    "status",
    "input_count",
    "deduped_count",
    "scored_count",
    "skipped_count",
    "execution_ready_count"
  ],
  "properties": {
    "batch_type": {
      "type": "string",
      "enum": ["intake", "scoring", "artifacts", "execution", "retry_reprocess"]
    },
    "status": {
      "type": "string",
      "enum": ["created", "running", "paused", "completed", "failed", "cancelled"]
    },
    "source_label": { "type": "string" },
    "input_count": { "type": "integer", "minimum": 0 },
    "deduped_count": { "type": "integer", "minimum": 0 },
    "scored_count": { "type": "integer", "minimum": 0 },
    "skipped_count": { "type": "integer", "minimum": 0 },
    "artifacts_queued_count": { "type": "integer", "minimum": 0 },
    "execution_ready_count": { "type": "integer", "minimum": 0 },
    "submitted_count": { "type": "integer", "minimum": 0 },
    "failed_count": { "type": "integer", "minimum": 0 },
    "dead_letter_count": { "type": "integer", "minimum": 0 }
  }
}
```

## A.8 Resume Plan Output

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "resume-plan-output.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "output_mode",
    "is_submittable",
    "target_role_positioning",
    "section_order",
    "selected_experience_ids",
    "selected_project_ids",
    "priority_keywords",
    "placeholders",
    "gap_map",
    "warnings"
  ],
  "properties": {
    "output_mode": {
      "type": "string",
      "enum": ["application", "benchmark"]
    },
    "is_submittable": { "type": "boolean" },
    "target_role_positioning": { "type": "string" },
    "section_order": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["summary", "skills", "experience", "projects", "education", "links"]
      }
    },
    "selected_experience_ids": {
      "type": "array",
      "items": { "type": "string" }
    },
    "selected_project_ids": {
      "type": "array",
      "items": { "type": "string" }
    },
    "priority_keywords": {
      "type": "array",
      "items": { "type": "string" }
    },
    "placeholders": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["placeholder_text", "reason", "source_id"],
        "properties": {
          "placeholder_text": { "type": "string" },
          "reason": { "type": "string" },
          "source_id": { "type": "string" }
        }
      }
    },
    "sample_stat_plan": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["sample_stat_text", "why_this_wins", "evidence_needed_to_make_real"],
        "properties": {
          "sample_stat_text": { "type": "string" },
          "why_this_wins": { "type": "string" },
          "evidence_needed_to_make_real": { "type": "string" }
        }
      }
    },
    "gap_map": {
      "type": "array",
      "items": { "type": "string" }
    },
    "warnings": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

## A.9 Screening Answer Output

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "screening-answer-output.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "canonical_question_key",
    "question_text",
    "answer_text",
    "answer_type",
    "confidence",
    "source_ids",
    "requires_manual_review",
    "cacheability"
  ],
  "properties": {
    "canonical_question_key": { "type": "string" },
    "question_text": { "type": "string" },
    "answer_text": { "type": "string" },
    "answer_type": {
      "type": "string",
      "enum": ["boolean", "short_text", "long_text", "numeric", "select_option"]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "source_ids": {
      "type": "array",
      "items": { "type": "string" }
    },
    "requires_manual_review": { "type": "boolean" },
    "cacheability": {
      "type": "string",
      "enum": ["stable_reusable", "suggest_reuse", "manual_only"]
    },
    "notes": { "type": "string" }
  }
}
```

## A.10 Review Decision Output

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "review-decision-output.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "scope_type",
    "entity_type",
    "entity_id",
    "decision",
    "review_notes"
  ],
  "properties": {
    "scope_type": {
      "type": "string",
      "enum": ["job", "batch", "artifact_bundle", "host_bucket"]
    },
    "entity_type": {
      "type": "string",
      "enum": ["resume", "answer_set", "upload", "submit", "fit_decision", "batch_review"]
    },
    "entity_id": { "type": "string" },
    "decision": {
      "type": "string",
      "enum": ["approved", "rejected", "edited", "skipped", "paused"]
    },
    "review_notes": { "type": "string" },
    "edited_payload": {
      "type": ["object", "null"]
    }
  }
}
```

---

# 28. Appendix B: Exact Initial Prompts

## B.1 System Prompt: JD Extraction

```text
You extract structured job requirements from a job description.

Rules:
- Output valid JSON only, matching the provided JSON Schema exactly.
- Do not invent details not supported by the input.
- If a field is not stated, use conservative defaults like "unknown" or an empty array as allowed by schema.
- Separate must-have skills from nice-to-have skills.
- Normalize obvious skill aliases conservatively.
- Keep responsibilities concise and factual.
- Detect work authorization, remote/on-site expectations, and red flags if explicitly or strongly implied.
- Parse confidence must reflect extraction certainty from 0 to 1.

Your task is extraction only. Do not score the candidate. Do not route lanes. Do not add prose outside the JSON object.
```

## B.2 System Prompt: Fit Scoring

```text
You score job fit for a single user against a structured master profile.

Rules:
- Output valid JSON only, matching the provided JSON Schema exactly.
- Score conservatively.
- Prefer under-claiming fit over over-claiming fit.
- Missing must-have skills should materially reduce the score.
- Unsupported assumptions are not allowed.
- Consider not only candidate fit but also truthful resume confidence and execution reality.
- Reward jobs that are suitable for the high-volume ATS/company lane.
- Penalize jobs that are fragile, duplicate-prone, or likely to require heavy manual work.
- Recommendation must be one of: apply, consider, skip.
- Reasoning must be concise and factual.

You are not writing a cover letter or a resume. You are deciding whether this role is worth artifact generation and execution effort.
```

## B.3 System Prompt: Lane Routing Support

```text
You assist a deterministic lane router for a job application system.

Rules:
- Output valid JSON only, matching the provided JSON Schema exactly.
- Prefer ATS/company execution lanes over LinkedIn when the apply path can be routed there.
- Treat LinkedIn as a restricted discovery/import/assist surface, not the main high-volume execution lane.
- Use API-first when credible public apply endpoints or stable structured application endpoints are indicated.
- Use structured adapter execution second.
- Use browser fallback third.
- Use manual_only when automation risk is too high or host capability is insufficient.
- Be conservative. When uncertain, choose the safer route and explain why.
- Do not invent host capabilities.

This task supports routing only. It does not authorize submission.
```

## B.4 System Prompt: Resume Tailoring

```text
You generate either a truthful recruiter-facing application resume or a clearly non-submittable benchmark resume from structured facts.

Rules:
- Output valid JSON only, matching the provided JSON Schema exactly.
- Respect the requested output_mode.
- In application mode, use only the supplied source facts and selected source IDs.
- In application mode, do not invent metrics, tools, ownership, dates, titles, achievements, scope, or impact.
- In application mode, if a metric would help but is missing, leave it out or use an explicit placeholder only if allowed by input.
- In benchmark mode, sample stats and example-only bullets are allowed only when explicitly labeled as synthetic and clearly non-submittable.
- Never blend synthetic benchmark claims into unlabeled real claims.
- Keep wording concise, recruiter-friendly, and ATS-safe.
- Avoid fluff and direct copying from the JD.

This task is generation from evidence. It is not permission to add facts.
```

## B.5 System Prompt: Short-Answer Generation

```text
You generate a concise, truthful application answer for a screening question.

Rules:
- Output valid JSON only, matching the provided JSON Schema exactly.
- Use only the supplied profile facts, reusable answers, and job/company context.
- Do not invent experience, eligibility, compensation history, or motivation.
- Prefer reusing approved stable answers when available.
- Mark whether the answer is stable_reusable, suggest_reuse, or manual_only.
- If the question is company-specific, motivational, sensitive, or ambiguous, set requires_manual_review to true.
- Keep the answer concise and direct.

This task is for screening answers, not for resume writing.
```

## B.6 System Prompt: Evidence Checking

```text
You verify whether generated recruiter-facing text is supported by supplied source facts.

Rules:
- Output valid JSON only.
- Evaluate each claim conservatively.
- Mark a claim as supported only if it is directly justified by the input facts or is a clearly conservative paraphrase.
- Do not treat missing metrics as supported.
- Do not allow semantic drift that upgrades scope, ownership, seniority, or outcome.
- Flag placeholders separately from unsupported claims.
- If output_mode = benchmark, clearly labeled example-only claims should be classified as sample_example, not as truthful supported claims.
- Your job is verification, not rewriting.

Return claim-level classifications and an overall block/warn recommendation.
```

## B.7 System Prompt: Unsupported Claim Detection

```text
You detect hallucinated or unsupported claims in recruiter-facing content.

Rules:
- Output valid JSON only.
- A claim is unsupported if it adds a fact, metric, title, scope, ownership, outcome, qualification, or timeline not grounded in the provided source facts.
- Conservative paraphrase is allowed.
- Inflated years of experience are unsupported.
- Implied but unverified metrics are unsupported unless explicitly marked as placeholders requiring user confirmation.
- In benchmark mode, a clearly labeled example-only claim may be classified as sample_example instead of unsupported.
- If any unsupported claim exists in application mode, recommend blocking export.

Your task is strict honesty enforcement.
```

## B.8 System Prompt: Execution Planning

```text
You assist with field-level execution planning for a job application.

Rules:
- Output valid JSON only.
- Use only the provided field descriptors, approved artifact metadata, approved answers, host type, and lane information.
- Do not invent field values.
- Prefer stable approved reusable answers.
- Flag any ambiguous field as requires_manual_review.
- Respect host and lane policy. LinkedIn should remain stricter than ATS/company execution.
- Your job is to propose a safe fill plan, not to override approval gates.

This task supports execution safety only.
```

## B.9 Recommended User Payload Shape: JD Extraction

```json
{
  "jobText": "<normalized job text>",
  "sourceMeta": {
    "url": "<optional>",
    "host": "<optional>",
    "sourceType": "pasted_text"
  }
}
```

## B.10 Recommended User Payload Shape: Fit Scoring

```json
{
  "extractedRequirements": {},
  "masterProfileSummary": {},
  "skillCoverage": {},
  "laneContext": {
    "knownHostType": "greenhouse",
    "knownExecutionHints": []
  },
  "relevantSourceUnits": []
}
```

## B.11 Recommended User Payload Shape: Lane Routing

```json
{
  "jobMeta": {
    "sourceHost": "boards.greenhouse.io",
    "sourceType": "company_url"
  },
  "hostCapabilityProfile": {},
  "fitSummary": {},
  "knownApplySignals": {}
}
```

## B.12 Recommended User Payload Shape: Resume Tailoring

```json
{
  "outputMode": "application",
  "jobRequirements": {},
  "resumeConstraints": {
    "onePageTarget": true,
    "atsSafe": true,
    "allowExplicitPlaceholders": true
  },
  "selectedSourceUnits": [],
  "priorityKeywords": []
}
```

## B.13 Recommended User Payload Shape: Short-Answer Generation

```json
{
  "questionText": "<application question>",
  "canonicalQuestionKey": "<if known>",
  "jobContext": {},
  "companyContext": {},
  "profileFacts": {},
  "reusableAnswerMatches": [],
  "laneContext": {
    "laneType": "ats_lane",
    "hostType": "greenhouse"
  }
}
```

---

# 29. Appendix C: Pseudocode for Core Flows

## C.1 `batchImportJobs()`

```ts
async function batchImportJobs(input: {
  sourceLabel: string;
  items: Array<{ sourceType: string; value: string }>;
}): Promise<{ batchId: string; imported: number; deduped: number }> {
  const batch = await db.batchRun.create({
    batch_type: "intake",
    status: "running",
    source_label: input.sourceLabel,
    input_count: input.items.length
  });

  let deduped = 0;

  for (const item of input.items) {
    const job = await jobIntake.createFromInput(item, batch.id);
    const duplicate = await duplicateService.check(job);

    if (duplicate.isDuplicate) {
      deduped += 1;
      await db.jobPosting.update(job.id, { duplicate_status: "duplicate" });
      continue;
    }

    await db.queueJob.create({
      batch_id: batch.id,
      job_posting_id: job.id,
      queue_name: "normalize",
      lane_type: "manual_fallback",
      execution_mode: "manual_only",
      queue_priority: 500,
      scheduler_status: "queued",
      host_bucket: normalizeHostBucket(job.source_host),
      retry_count: 0,
      submit_gate_required: true
    });
  }

  await db.batchRun.update(batch.id, {
    deduped_count: deduped,
    status: "completed"
  });

  return {
    batchId: batch.id,
    imported: input.items.length,
    deduped
  };
}
```

## C.2 `routeJobToLane()`

```ts
async function routeJobToLane(jobPostingId: string): Promise<LaneRouteDecision> {
  const job = await db.jobPosting.get(jobPostingId);
  const fit = await db.fitScore.getByJobId(jobPostingId);
  const hostProfile = await registry.hostCapabilities.resolve(job.source_host);

  const route = deterministicRouter.resolve({
    sourceType: job.source_type,
    sourceHost: job.source_host,
    fit,
    hostProfile
  });

  const approvalPolicy = policyResolver.resolveApproval(route);
  const executionPolicy = policyResolver.resolveExecution(route);

  const decision = await db.laneRouteDecision.upsertForJob(jobPostingId, {
    lane_type: route.lane_type,
    execution_mode: route.execution_mode,
    host_type: route.host_type,
    host_risk_tier: route.host_risk_tier,
    approval_scope: approvalPolicy.submit_review_scope === "per_batch" ? "per_batch" : "per_job",
    submit_gate_required: true,
    batch_safe: hostProfile.batch_safe,
    fragility_score: hostProfile.fragility_score,
    route_reason_json: route.reasoning
  });

  await db.jobPosting.update(jobPostingId, {
    lane_type: decision.lane_type,
    execution_mode: decision.execution_mode,
    host_risk_tier: decision.host_risk_tier,
    scheduler_status: "queued"
  });

  return decision;
}
```

## C.3 `scheduleArtifactsForTopJobs()`

```ts
async function scheduleArtifactsForTopJobs(batchId: string): Promise<number> {
  const jobs = await db.jobPosting.listScoredByBatch(batchId);
  const budget = config.costControls.onlyGenerateArtifactsForTopPercent;
  const topJobs = selectTopJobsForArtifacts(jobs, budget);

  let count = 0;

  for (const job of topJobs) {
    const route = await db.laneRouteDecision.getByJobId(job.id);
    if (!route) continue;
    if (job.duplicate_status === "duplicate") continue;
    if (job.execution_mode === "manual_only" && job.overall_score < 80) continue;

    await db.queueJob.create({
      batch_id: batchId,
      job_posting_id: job.id,
      queue_name: "artifacts",
      lane_type: route.lane_type,
      execution_mode: route.execution_mode,
      queue_priority: computeArtifactPriority(job),
      scheduler_status: "queued",
      host_bucket: normalizeHostBucket(job.source_host),
      retry_count: 0,
      submit_gate_required: true
    });
    count += 1;
  }

  await db.batchRun.update(batchId, { artifacts_queued_count: count });
  return count;
}
```

## C.4 `executeATSBatch()`

```ts
async function executeATSBatch(batchId: string): Promise<void> {
  const readyJobs = await db.queueJob.listReadyForExecution(batchId);

  const buckets = bucketBy(readyJobs, j => j.host_bucket);
  for (const [hostBucket, jobs] of Object.entries(buckets)) {
    await executeHostBucket(hostBucket, jobs);
  }
}
```

## C.5 `executeHostBucket()`

```ts
async function executeHostBucket(hostBucket: string, jobs: QueueJob[]): Promise<void> {
  const hostProfile = await registry.hostCapabilities.resolveBucket(hostBucket);
  const execPolicy = policyResolver.resolveExecutionFromHost(hostProfile);

  if (await hostHealth.isPaused(hostBucket)) {
    return;
  }

  const queue = new PQueue({
    concurrency: execPolicy.max_concurrency,
    intervalCap: execPolicy.rate_limit_per_minute,
    interval: 60_000
  });

  for (const job of jobs) {
    queue.add(async () => {
      const leased = await scheduler.tryLease(job.id);
      if (!leased) return;

      try {
        const artifactBundle = await db.artifactBundle.getApprovedByJobId(job.job_posting_id);
        if (!artifactBundle) throw new Error("missing-approved-artifact-bundle");

        const route = await db.laneRouteDecision.getByJobId(job.job_posting_id);
        const adapter = await adapterRegistry.resolve(route.execution_mode, hostBucket);

        const result = await adapter.executeApply({
          jobPostingId: job.job_posting_id,
          artifactBundleId: artifactBundle.id,
          queueJobId: job.id,
          policy: execPolicy,
          dryRun: false
        });

        if (result.awaitingSubmitGate) {
          await db.queueJob.update(job.id, { scheduler_status: "paused" });
          return;
        }

        await db.queueJob.markCompleted(job.id);
        await hostHealth.recordSuccess(hostBucket, result.durationMs);
      } catch (err) {
        await hostHealth.recordFailure(hostBucket, err);
        await retryFailedExecution(job.id, err);
      } finally {
        await scheduler.releaseLease(job.id);
      }
    });
  }

  await queue.onIdle();
}
```

## C.6 `handleBatchApproval()`

```ts
async function handleBatchApproval(input: {
  batchId: string;
  scope: "artifacts" | "answers" | "submit";
  hostBucket?: string;
}): Promise<{ approvedCount: number; rejectedCount: number }> {
  const items = await approvalQueries.loadBatchReviewItems(input);
  const reviewRequest = await uiBus.requestBatchReview({
    batchId: input.batchId,
    scope: input.scope,
    items
  });

  const decisions = await waitForBatchDecisions(reviewRequest.id);

  let approvedCount = 0;
  let rejectedCount = 0;

  for (const decision of decisions) {
    await db.reviewDecision.create({
      scope_type: "batch",
      entity_type: input.scope === "submit" ? "submit" : input.scope === "answers" ? "answer_set" : "batch_review",
      entity_id: decision.entityId,
      decision: decision.action,
      review_notes: decision.notes,
      edited_payload_json: decision.editedPayload ?? null
    });

    if (decision.action === "approved") approvedCount += 1;
    if (decision.action === "rejected") rejectedCount += 1;
  }

  return { approvedCount, rejectedCount };
}
```

## C.7 `runLinkedInRestrictedAssist()`

```ts
async function runLinkedInRestrictedAssist(input: {
  jobPostingId: string;
  linkedInUrl: string;
}): Promise<void> {
  const route = await db.laneRouteDecision.getByJobId(input.jobPostingId);
  if (!route || route.lane_type !== "linkedin_restricted") {
    throw new Error("job-not-routed-to-linkedin-restricted");
  }

  const approved = await uiBus.requestSingleApproval({
    entityType: "submit",
    entityId: input.jobPostingId,
    title: "Open LinkedIn assist flow?"
  });

  if (!approved) return;

  const browser = await browserRuntime.launchPersistent();
  const page = await browser.newPage();

  await page.goto(input.linkedInUrl, { waitUntil: "domcontentloaded" });

  const assistContext = await linkedinAdapter.extractAssistContext(page);
  const artifactBundle = await db.artifactBundle.getApprovedByJobId(input.jobPostingId);

  if (!artifactBundle) {
    await db.jobPosting.update(input.jobPostingId, { scheduler_status: "manual_takeover" });
    return;
  }

  const fillPlan = await linkedinAdapter.buildAssistPlan({
    page,
    artifactBundle,
    strictMode: true
  });

  const stepApproved = await uiBus.requestSingleApproval({
    entityType: "upload",
    entityId: input.jobPostingId,
    title: "Use approved artifacts and answers in LinkedIn assist mode?"
  });

  if (!stepApproved) return;

  await linkedinAdapter.executeAssistFill(page, fillPlan);

  await uiBus.requestSingleApproval({
    entityType: "submit",
    entityId: input.jobPostingId,
    title: "Final LinkedIn submit requires explicit manual approval"
  });
}
```

## C.8 `retryFailedExecution()`

```ts
async function retryFailedExecution(queueJobId: string, error: unknown): Promise<void> {
  const job = await db.queueJob.get(queueJobId);
  const route = await db.laneRouteDecision.getByJobId(job.job_posting_id);
  const policy = policyResolver.resolveExecution(route);

  const nextRetryCount = job.retry_count + 1;
  if (nextRetryCount > policy.retry_policy.max_retries) {
    await deadLetterJob(queueJobId, "retry_budget_exhausted", String(error));
    return;
  }

  const backoffSeconds = policy.retry_policy.backoff_seconds[nextRetryCount - 1] ?? 3600;
  const nextRetryAt = new Date(Date.now() + backoffSeconds * 1000).toISOString();

  await db.retryEvent.create({
    queue_job_id: queueJobId,
    host: job.host_bucket,
    retry_reason: normalizeError(error),
    retry_count: nextRetryCount,
    backoff_seconds: backoffSeconds,
    scheduled_for: nextRetryAt
  });

  await db.queueJob.update(queueJobId, {
    retry_count: nextRetryCount,
    next_retry_at: nextRetryAt,
    scheduler_status: "retry_scheduled",
    last_error_summary: normalizeError(error)
  });
}
```

## C.9 `deadLetterJob()`

```ts
async function deadLetterJob(
  queueJobId: string,
  reasonCode: string,
  reasonSummary: string
): Promise<void> {
  const job = await db.queueJob.get(queueJobId);

  await db.deadLetterEvent.create({
    queue_job_id: queueJobId,
    job_posting_id: job.job_posting_id,
    host: job.host_bucket,
    lane_type: job.lane_type,
    execution_mode: job.execution_mode,
    reason_code: reasonCode,
    reason_summary: reasonSummary
  });

  await db.queueJob.update(queueJobId, {
    scheduler_status: "dead_lettered",
    last_error_summary: reasonSummary
  });

  await db.jobPosting.update(job.job_posting_id, {
    scheduler_status: "dead_lettered"
  });
}
```
