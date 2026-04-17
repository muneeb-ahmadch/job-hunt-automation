-- Migration: 0001_foundation
-- Note: Creates the local-first foundation tables for profiles, batches, jobs,
-- routes, policy registries, queues, artifacts, approvals, attempts, retries,
-- dead letters, host health, run metadata, and audit events.
-- Rollback strategy: for a fresh local install, remove data/local/app.sqlite.
-- For a populated database, export needed tables first; audit history should be
-- preserved rather than destructively rolled back.

CREATE TABLE IF NOT EXISTS migration_state (
  id TEXT PRIMARY KEY NOT NULL,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS run_metadata (
  id TEXT PRIMARY KEY NOT NULL,
  component TEXT NOT NULL,
  dry_run INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'running',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_event (
  id TEXT PRIMARY KEY NOT NULL,
  run_id TEXT REFERENCES run_metadata(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  event_type TEXT NOT NULL,
  event_payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS audit_event_entity_idx ON audit_event(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_event_run_idx ON audit_event(run_id);

CREATE TABLE IF NOT EXISTS master_profile (
  id TEXT PRIMARY KEY NOT NULL,
  profile_version INTEGER NOT NULL DEFAULT 1,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location_city TEXT,
  location_country TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  headline TEXT,
  summary TEXT,
  target_roles_json TEXT NOT NULL DEFAULT '[]',
  remote_preferences_json TEXT NOT NULL DEFAULT '{}',
  work_authorization_json TEXT NOT NULL DEFAULT '{}',
  salary_preferences_json TEXT NOT NULL DEFAULT '{}',
  notice_period_text TEXT,
  default_resume_template_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experience_bank (
  id TEXT PRIMARY KEY NOT NULL,
  master_profile_id TEXT NOT NULL REFERENCES master_profile(id),
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  is_current INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  responsibilities_json TEXT NOT NULL DEFAULT '[]',
  raw_bullets_json TEXT NOT NULL DEFAULT '[]',
  skills_json TEXT NOT NULL DEFAULT '[]',
  tools_json TEXT NOT NULL DEFAULT '[]',
  evidence_item_ids_json TEXT NOT NULL DEFAULT '[]',
  claim_confidence TEXT NOT NULL DEFAULT 'user_asserted',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_bank (
  id TEXT PRIMARY KEY NOT NULL,
  master_profile_id TEXT NOT NULL REFERENCES master_profile(id),
  name TEXT NOT NULL,
  project_type TEXT,
  summary TEXT,
  problem_statement TEXT,
  actions_json TEXT NOT NULL DEFAULT '[]',
  outcomes_json TEXT NOT NULL DEFAULT '[]',
  skills_json TEXT NOT NULL DEFAULT '[]',
  links_json TEXT NOT NULL DEFAULT '[]',
  evidence_item_ids_json TEXT NOT NULL DEFAULT '[]',
  claim_confidence TEXT NOT NULL DEFAULT 'user_asserted',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evidence_item (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_path_or_url TEXT,
  metric_label TEXT,
  metric_value_text TEXT,
  verification_status TEXT NOT NULL DEFAULT 'user_asserted',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batch_run (
  id TEXT PRIMARY KEY NOT NULL,
  batch_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  source_label TEXT,
  input_count INTEGER NOT NULL DEFAULT 0,
  deduped_count INTEGER NOT NULL DEFAULT 0,
  scored_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  artifacts_queued_count INTEGER NOT NULL DEFAULT 0,
  execution_ready_count INTEGER NOT NULL DEFAULT 0,
  submitted_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  dead_letter_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TEXT,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS job_posting (
  id TEXT PRIMARY KEY NOT NULL,
  batch_id TEXT REFERENCES batch_run(id),
  source_type TEXT NOT NULL,
  source_url TEXT,
  source_host TEXT,
  external_job_id TEXT,
  canonical_url_hash TEXT,
  company_name TEXT,
  job_title TEXT,
  location_text TEXT,
  work_model_text TEXT,
  employment_type_text TEXT,
  salary_text TEXT,
  raw_html_path TEXT,
  raw_text TEXT,
  normalized_text TEXT,
  content_hash TEXT,
  import_status TEXT NOT NULL DEFAULT 'imported',
  import_error TEXT,
  lane_type TEXT,
  execution_mode TEXT,
  host_risk_tier TEXT,
  queue_priority INTEGER NOT NULL DEFAULT 0,
  scheduler_status TEXT NOT NULL DEFAULT 'queued',
  duplicate_status TEXT NOT NULL DEFAULT 'unknown',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS job_posting_batch_idx ON job_posting(batch_id);
CREATE INDEX IF NOT EXISTS job_posting_content_hash_idx ON job_posting(content_hash);
CREATE UNIQUE INDEX IF NOT EXISTS job_posting_canonical_url_hash_unique ON job_posting(canonical_url_hash);

CREATE TABLE IF NOT EXISTS extracted_requirements (
  id TEXT PRIMARY KEY NOT NULL,
  job_posting_id TEXT NOT NULL REFERENCES job_posting(id),
  extraction_json TEXT NOT NULL,
  prompt_version TEXT,
  model_name TEXT,
  source_content_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fit_score (
  id TEXT PRIMARY KEY NOT NULL,
  job_posting_id TEXT NOT NULL REFERENCES job_posting(id),
  profile_version INTEGER NOT NULL,
  overall_score REAL NOT NULL,
  application_friction_score REAL NOT NULL,
  resume_match_confidence_score REAL NOT NULL,
  lane_suitability_score REAL NOT NULL,
  host_execution_score REAL NOT NULL,
  recommendation TEXT NOT NULL,
  matched_strengths_json TEXT NOT NULL DEFAULT '[]',
  missing_must_haves_json TEXT NOT NULL DEFAULT '[]',
  disqualifier_flags_json TEXT NOT NULL DEFAULT '[]',
  rationale_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lane_route_decision (
  id TEXT PRIMARY KEY NOT NULL,
  job_posting_id TEXT NOT NULL REFERENCES job_posting(id),
  lane_type TEXT NOT NULL,
  execution_mode TEXT NOT NULL,
  route_reason_json TEXT NOT NULL DEFAULT '[]',
  host_type TEXT NOT NULL,
  host_risk_tier TEXT NOT NULL,
  approval_scope TEXT NOT NULL,
  submit_gate_required INTEGER NOT NULL,
  batch_safe INTEGER NOT NULL,
  fragility_score REAL NOT NULL,
  requires_login INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS host_capability_profile (
  id TEXT PRIMARY KEY NOT NULL,
  host TEXT NOT NULL,
  site_type TEXT NOT NULL,
  supports_public_job_fetch INTEGER NOT NULL,
  supports_api_apply INTEGER NOT NULL,
  supports_adapter_apply INTEGER NOT NULL,
  requires_browser INTEGER NOT NULL,
  fragility_score REAL NOT NULL,
  approval_strictness TEXT NOT NULL,
  authentication_burden TEXT NOT NULL,
  batch_safe INTEGER NOT NULL,
  default_max_concurrency INTEGER NOT NULL,
  default_rate_limit_per_minute INTEGER NOT NULL,
  cool_off_seconds INTEGER NOT NULL,
  captcha_likelihood REAL,
  upload_strategy TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS host_capability_profile_host_unique ON host_capability_profile(host);

CREATE TABLE IF NOT EXISTS execution_policy (
  id TEXT PRIMARY KEY NOT NULL,
  policy_key TEXT NOT NULL,
  lane_type TEXT NOT NULL,
  host_risk_tier TEXT NOT NULL,
  execution_mode TEXT NOT NULL,
  max_concurrency INTEGER NOT NULL,
  rate_limit_per_minute INTEGER NOT NULL,
  approval_scope TEXT NOT NULL,
  submit_mode TEXT NOT NULL,
  retry_policy_json TEXT NOT NULL,
  captcha_policy TEXT NOT NULL,
  timeout_policy_json TEXT NOT NULL,
  upload_policy TEXT NOT NULL,
  answer_policy TEXT,
  manual_takeover_threshold REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS execution_policy_key_unique ON execution_policy(policy_key);

CREATE TABLE IF NOT EXISTS approval_policy (
  id TEXT PRIMARY KEY NOT NULL,
  policy_key TEXT NOT NULL,
  lane_type TEXT NOT NULL,
  host_risk_tier TEXT NOT NULL,
  artifact_review_scope TEXT NOT NULL,
  answer_review_scope TEXT NOT NULL,
  submit_review_scope TEXT NOT NULL,
  allow_batch_artifact_approval INTEGER NOT NULL,
  allow_batch_submit_approval INTEGER NOT NULL,
  requires_manual_submit_preview INTEGER NOT NULL,
  requires_new_answer_review INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS approval_policy_key_unique ON approval_policy(policy_key);

CREATE TABLE IF NOT EXISTS artifact_bundle (
  id TEXT PRIMARY KEY NOT NULL,
  job_posting_id TEXT NOT NULL REFERENCES job_posting(id),
  batch_id TEXT NOT NULL REFERENCES batch_run(id),
  resume_id TEXT,
  cover_letter_id TEXT,
  answer_set_id TEXT,
  output_mode TEXT NOT NULL,
  is_submittable INTEGER NOT NULL,
  artifact_hash TEXT NOT NULL,
  artifact_status TEXT NOT NULL,
  approval_status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_decision (
  id TEXT PRIMARY KEY NOT NULL,
  scope_type TEXT NOT NULL,
  approval_scope TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  review_notes TEXT NOT NULL DEFAULT '',
  edited_payload_json TEXT,
  reviewed_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS queue_job (
  id TEXT PRIMARY KEY NOT NULL,
  batch_id TEXT NOT NULL REFERENCES batch_run(id),
  job_posting_id TEXT NOT NULL REFERENCES job_posting(id),
  queue_name TEXT NOT NULL,
  lane_type TEXT NOT NULL,
  execution_mode TEXT NOT NULL,
  queue_priority INTEGER NOT NULL DEFAULT 0,
  scheduler_status TEXT NOT NULL DEFAULT 'queued',
  host_bucket TEXT NOT NULL,
  lease_token TEXT,
  lease_expires_at TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  next_retry_at TEXT,
  last_error_code TEXT,
  last_error_summary TEXT,
  artifact_bundle_id TEXT REFERENCES artifact_bundle(id),
  submit_gate_required INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS queue_job_lease_idx ON queue_job(queue_name, scheduler_status, host_bucket);
CREATE INDEX IF NOT EXISTS queue_job_priority_idx ON queue_job(queue_priority, created_at);

CREATE TABLE IF NOT EXISTS execution_attempt (
  id TEXT PRIMARY KEY NOT NULL,
  job_posting_id TEXT NOT NULL REFERENCES job_posting(id),
  artifact_bundle_id TEXT REFERENCES artifact_bundle(id),
  queue_job_id TEXT NOT NULL REFERENCES queue_job(id),
  host TEXT NOT NULL,
  host_bucket TEXT NOT NULL,
  lane_type TEXT NOT NULL,
  execution_mode TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  workflow_state TEXT NOT NULL,
  current_step TEXT,
  dry_run INTEGER NOT NULL,
  approval_scope TEXT NOT NULL,
  started_at TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  result TEXT,
  failure_reason TEXT,
  final_review_decision_id TEXT REFERENCES review_decision(id)
);

CREATE TABLE IF NOT EXISTS submission_event (
  id TEXT PRIMARY KEY NOT NULL,
  execution_attempt_id TEXT NOT NULL REFERENCES execution_attempt(id),
  job_posting_id TEXT NOT NULL REFERENCES job_posting(id),
  event_type TEXT NOT NULL,
  event_payload_json TEXT NOT NULL DEFAULT '{}',
  artifact_path TEXT,
  screenshot_path TEXT,
  dom_snapshot_path TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS retry_event (
  id TEXT PRIMARY KEY NOT NULL,
  queue_job_id TEXT NOT NULL REFERENCES queue_job(id),
  execution_attempt_id TEXT REFERENCES execution_attempt(id),
  host TEXT NOT NULL,
  retry_reason TEXT NOT NULL,
  retry_count INTEGER NOT NULL,
  backoff_seconds INTEGER NOT NULL,
  scheduled_for TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dead_letter_event (
  id TEXT PRIMARY KEY NOT NULL,
  queue_job_id TEXT NOT NULL REFERENCES queue_job(id),
  job_posting_id TEXT NOT NULL REFERENCES job_posting(id),
  host TEXT NOT NULL,
  lane_type TEXT NOT NULL,
  execution_mode TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  reason_summary TEXT NOT NULL,
  last_error_snapshot_path TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS host_health_snapshot (
  id TEXT PRIMARY KEY NOT NULL,
  host TEXT NOT NULL,
  window_start TEXT NOT NULL,
  window_end TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  retry_count INTEGER NOT NULL DEFAULT 0,
  dead_letter_count INTEGER NOT NULL DEFAULT 0,
  captcha_count INTEGER NOT NULL DEFAULT 0,
  median_duration_ms INTEGER,
  effective_concurrency INTEGER NOT NULL DEFAULT 1,
  effective_rate_limit INTEGER NOT NULL DEFAULT 1,
  health_status TEXT NOT NULL DEFAULT 'healthy',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS application_duplicate_index (
  id TEXT PRIMARY KEY NOT NULL,
  job_posting_id TEXT NOT NULL REFERENCES job_posting(id),
  canonical_url_hash TEXT,
  content_hash TEXT,
  company_name TEXT,
  job_title TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS application_duplicate_index_url_hash_idx ON application_duplicate_index(canonical_url_hash);
CREATE INDEX IF NOT EXISTS application_duplicate_index_content_hash_idx ON application_duplicate_index(content_hash);
