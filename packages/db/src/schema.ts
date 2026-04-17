import { sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const createdAt = text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`);
const updatedAt = text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`);

export const migrationState = sqliteTable("migration_state", {
  id: text("id").primaryKey(),
  appliedAt: text("applied_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const runMetadata = sqliteTable("run_metadata", {
  id: text("id").primaryKey(),
  component: text("component").notNull(),
  dryRun: integer("dry_run", { mode: "boolean" }).notNull(),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  status: text("status").notNull().default("running"),
  metadataJson: text("metadata_json").notNull().default("{}"),
  createdAt,
  updatedAt
});

export const auditEvents = sqliteTable(
  "audit_event",
  {
    id: text("id").primaryKey(),
    runId: text("run_id").references(() => runMetadata.id),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    eventType: text("event_type").notNull(),
    eventPayloadJson: text("event_payload_json").notNull().default("{}"),
    createdAt
  },
  (table) => ({
    entityIdx: index("audit_event_entity_idx").on(table.entityType, table.entityId),
    runIdx: index("audit_event_run_idx").on(table.runId)
  })
);

export const masterProfiles = sqliteTable("master_profile", {
  id: text("id").primaryKey(),
  profileVersion: integer("profile_version").notNull().default(1),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  locationCity: text("location_city"),
  locationCountry: text("location_country"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
  headline: text("headline"),
  summary: text("summary"),
  targetRolesJson: text("target_roles_json").notNull().default("[]"),
  remotePreferencesJson: text("remote_preferences_json").notNull().default("{}"),
  workAuthorizationJson: text("work_authorization_json").notNull().default("{}"),
  salaryPreferencesJson: text("salary_preferences_json").notNull().default("{}"),
  noticePeriodText: text("notice_period_text"),
  defaultResumeTemplateId: text("default_resume_template_id"),
  createdAt,
  updatedAt
});

export const experienceBank = sqliteTable("experience_bank", {
  id: text("id").primaryKey(),
  masterProfileId: text("master_profile_id").notNull().references(() => masterProfiles.id),
  companyName: text("company_name").notNull(),
  roleTitle: text("role_title").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
  summary: text("summary"),
  responsibilitiesJson: text("responsibilities_json").notNull().default("[]"),
  rawBulletsJson: text("raw_bullets_json").notNull().default("[]"),
  skillsJson: text("skills_json").notNull().default("[]"),
  toolsJson: text("tools_json").notNull().default("[]"),
  evidenceItemIdsJson: text("evidence_item_ids_json").notNull().default("[]"),
  claimConfidence: text("claim_confidence").notNull().default("user_asserted"),
  createdAt,
  updatedAt
});

export const projectBank = sqliteTable("project_bank", {
  id: text("id").primaryKey(),
  masterProfileId: text("master_profile_id").notNull().references(() => masterProfiles.id),
  name: text("name").notNull(),
  projectType: text("project_type"),
  summary: text("summary"),
  problemStatement: text("problem_statement"),
  actionsJson: text("actions_json").notNull().default("[]"),
  outcomesJson: text("outcomes_json").notNull().default("[]"),
  skillsJson: text("skills_json").notNull().default("[]"),
  linksJson: text("links_json").notNull().default("[]"),
  evidenceItemIdsJson: text("evidence_item_ids_json").notNull().default("[]"),
  claimConfidence: text("claim_confidence").notNull().default("user_asserted"),
  createdAt,
  updatedAt
});

export const evidenceItems = sqliteTable("evidence_item", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  evidenceType: text("evidence_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  sourcePathOrUrl: text("source_path_or_url"),
  metricLabel: text("metric_label"),
  metricValueText: text("metric_value_text"),
  verificationStatus: text("verification_status").notNull().default("user_asserted"),
  createdAt,
  updatedAt
});

export const batchRuns = sqliteTable("batch_run", {
  id: text("id").primaryKey(),
  batchType: text("batch_type").notNull(),
  status: text("status").notNull().default("created"),
  sourceLabel: text("source_label"),
  inputCount: integer("input_count").notNull().default(0),
  dedupedCount: integer("deduped_count").notNull().default(0),
  scoredCount: integer("scored_count").notNull().default(0),
  skippedCount: integer("skipped_count").notNull().default(0),
  artifactsQueuedCount: integer("artifacts_queued_count").notNull().default(0),
  executionReadyCount: integer("execution_ready_count").notNull().default(0),
  submittedCount: integer("submitted_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  deadLetterCount: integer("dead_letter_count").notNull().default(0),
  createdAt,
  startedAt: text("started_at"),
  completedAt: text("completed_at")
});

export const jobPostings = sqliteTable(
  "job_posting",
  {
    id: text("id").primaryKey(),
    batchId: text("batch_id").references(() => batchRuns.id),
    sourceType: text("source_type").notNull(),
    sourceUrl: text("source_url"),
    sourceHost: text("source_host"),
    externalJobId: text("external_job_id"),
    canonicalUrlHash: text("canonical_url_hash"),
    companyName: text("company_name"),
    jobTitle: text("job_title"),
    locationText: text("location_text"),
    workModelText: text("work_model_text"),
    employmentTypeText: text("employment_type_text"),
    salaryText: text("salary_text"),
    rawHtmlPath: text("raw_html_path"),
    rawText: text("raw_text"),
    normalizedText: text("normalized_text"),
    contentHash: text("content_hash"),
    importStatus: text("import_status").notNull().default("imported"),
    importError: text("import_error"),
    laneType: text("lane_type"),
    executionMode: text("execution_mode"),
    hostRiskTier: text("host_risk_tier"),
    queuePriority: integer("queue_priority").notNull().default(0),
    schedulerStatus: text("scheduler_status").notNull().default("queued"),
    duplicateStatus: text("duplicate_status").notNull().default("unknown"),
    createdAt,
    updatedAt
  },
  (table) => ({
    batchIdx: index("job_posting_batch_idx").on(table.batchId),
    contentHashIdx: index("job_posting_content_hash_idx").on(table.contentHash),
    canonicalHashUnique: uniqueIndex("job_posting_canonical_url_hash_unique").on(table.canonicalUrlHash)
  })
);

export const extractedRequirements = sqliteTable("extracted_requirements", {
  id: text("id").primaryKey(),
  jobPostingId: text("job_posting_id").notNull().references(() => jobPostings.id),
  extractionJson: text("extraction_json").notNull(),
  promptVersion: text("prompt_version"),
  modelName: text("model_name"),
  sourceContentHash: text("source_content_hash"),
  createdAt,
  updatedAt
});

export const fitScores = sqliteTable("fit_score", {
  id: text("id").primaryKey(),
  jobPostingId: text("job_posting_id").notNull().references(() => jobPostings.id),
  profileVersion: integer("profile_version").notNull(),
  overallScore: real("overall_score").notNull(),
  applicationFrictionScore: real("application_friction_score").notNull(),
  resumeMatchConfidenceScore: real("resume_match_confidence_score").notNull(),
  laneSuitabilityScore: real("lane_suitability_score").notNull(),
  hostExecutionScore: real("host_execution_score").notNull(),
  recommendation: text("recommendation").notNull(),
  matchedStrengthsJson: text("matched_strengths_json").notNull().default("[]"),
  missingMustHavesJson: text("missing_must_haves_json").notNull().default("[]"),
  disqualifierFlagsJson: text("disqualifier_flags_json").notNull().default("[]"),
  rationaleJson: text("rationale_json").notNull().default("[]"),
  createdAt,
  updatedAt
});

export const laneRouteDecisions = sqliteTable("lane_route_decision", {
  id: text("id").primaryKey(),
  jobPostingId: text("job_posting_id").notNull().references(() => jobPostings.id),
  laneType: text("lane_type").notNull(),
  executionMode: text("execution_mode").notNull(),
  routeReasonJson: text("route_reason_json").notNull().default("[]"),
  hostType: text("host_type").notNull(),
  hostRiskTier: text("host_risk_tier").notNull(),
  approvalScope: text("approval_scope").notNull(),
  submitGateRequired: integer("submit_gate_required", { mode: "boolean" }).notNull(),
  batchSafe: integer("batch_safe", { mode: "boolean" }).notNull(),
  fragilityScore: real("fragility_score").notNull(),
  requiresLogin: integer("requires_login", { mode: "boolean" }).notNull().default(false),
  createdAt
});

export const hostCapabilityProfiles = sqliteTable(
  "host_capability_profile",
  {
    id: text("id").primaryKey(),
    host: text("host").notNull(),
    siteType: text("site_type").notNull(),
    supportsPublicJobFetch: integer("supports_public_job_fetch", { mode: "boolean" }).notNull(),
    supportsApiApply: integer("supports_api_apply", { mode: "boolean" }).notNull(),
    supportsAdapterApply: integer("supports_adapter_apply", { mode: "boolean" }).notNull(),
    requiresBrowser: integer("requires_browser", { mode: "boolean" }).notNull(),
    fragilityScore: real("fragility_score").notNull(),
    approvalStrictness: text("approval_strictness").notNull(),
    authenticationBurden: text("authentication_burden").notNull(),
    batchSafe: integer("batch_safe", { mode: "boolean" }).notNull(),
    defaultMaxConcurrency: integer("default_max_concurrency").notNull(),
    defaultRateLimitPerMinute: integer("default_rate_limit_per_minute").notNull(),
    coolOffSeconds: integer("cool_off_seconds").notNull(),
    captchaLikelihood: real("captcha_likelihood"),
    uploadStrategy: text("upload_strategy"),
    notes: text("notes"),
    createdAt,
    updatedAt
  },
  (table) => ({
    hostUnique: uniqueIndex("host_capability_profile_host_unique").on(table.host)
  })
);

export const executionPolicies = sqliteTable(
  "execution_policy",
  {
    id: text("id").primaryKey(),
    policyKey: text("policy_key").notNull(),
    laneType: text("lane_type").notNull(),
    hostRiskTier: text("host_risk_tier").notNull(),
    executionMode: text("execution_mode").notNull(),
    maxConcurrency: integer("max_concurrency").notNull(),
    rateLimitPerMinute: integer("rate_limit_per_minute").notNull(),
    approvalScope: text("approval_scope").notNull(),
    submitMode: text("submit_mode").notNull(),
    retryPolicyJson: text("retry_policy_json").notNull(),
    captchaPolicy: text("captcha_policy").notNull(),
    timeoutPolicyJson: text("timeout_policy_json").notNull(),
    uploadPolicy: text("upload_policy").notNull(),
    answerPolicy: text("answer_policy"),
    manualTakeoverThreshold: real("manual_takeover_threshold"),
    createdAt,
    updatedAt
  },
  (table) => ({
    policyKeyUnique: uniqueIndex("execution_policy_key_unique").on(table.policyKey)
  })
);

export const approvalPolicies = sqliteTable(
  "approval_policy",
  {
    id: text("id").primaryKey(),
    policyKey: text("policy_key").notNull(),
    laneType: text("lane_type").notNull(),
    hostRiskTier: text("host_risk_tier").notNull(),
    artifactReviewScope: text("artifact_review_scope").notNull(),
    answerReviewScope: text("answer_review_scope").notNull(),
    submitReviewScope: text("submit_review_scope").notNull(),
    allowBatchArtifactApproval: integer("allow_batch_artifact_approval", { mode: "boolean" }).notNull(),
    allowBatchSubmitApproval: integer("allow_batch_submit_approval", { mode: "boolean" }).notNull(),
    requiresManualSubmitPreview: integer("requires_manual_submit_preview", { mode: "boolean" }).notNull(),
    requiresNewAnswerReview: integer("requires_new_answer_review", { mode: "boolean" }).notNull(),
    createdAt,
    updatedAt
  },
  (table) => ({
    policyKeyUnique: uniqueIndex("approval_policy_key_unique").on(table.policyKey)
  })
);

export const artifactBundles = sqliteTable("artifact_bundle", {
  id: text("id").primaryKey(),
  jobPostingId: text("job_posting_id").notNull().references(() => jobPostings.id),
  batchId: text("batch_id").notNull().references(() => batchRuns.id),
  resumeId: text("resume_id"),
  coverLetterId: text("cover_letter_id"),
  answerSetId: text("answer_set_id"),
  outputMode: text("output_mode").notNull(),
  isSubmittable: integer("is_submittable", { mode: "boolean" }).notNull(),
  artifactHash: text("artifact_hash").notNull(),
  artifactStatus: text("artifact_status").notNull(),
  approvalStatus: text("approval_status").notNull(),
  createdAt,
  updatedAt
});

export const reviewDecisions = sqliteTable("review_decision", {
  id: text("id").primaryKey(),
  scopeType: text("scope_type").notNull(),
  approvalScope: text("approval_scope").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  decision: text("decision").notNull(),
  reviewNotes: text("review_notes").notNull().default(""),
  editedPayloadJson: text("edited_payload_json"),
  reviewedAt: text("reviewed_at").notNull(),
  createdAt
});

export const queueJobs = sqliteTable(
  "queue_job",
  {
    id: text("id").primaryKey(),
    batchId: text("batch_id").notNull().references(() => batchRuns.id),
    jobPostingId: text("job_posting_id").notNull().references(() => jobPostings.id),
    queueName: text("queue_name").notNull(),
    laneType: text("lane_type").notNull(),
    executionMode: text("execution_mode").notNull(),
    queuePriority: integer("queue_priority").notNull().default(0),
    schedulerStatus: text("scheduler_status").notNull().default("queued"),
    hostBucket: text("host_bucket").notNull(),
    leaseToken: text("lease_token"),
    leaseExpiresAt: text("lease_expires_at"),
    retryCount: integer("retry_count").notNull().default(0),
    nextRetryAt: text("next_retry_at"),
    lastErrorCode: text("last_error_code"),
    lastErrorSummary: text("last_error_summary"),
    artifactBundleId: text("artifact_bundle_id").references(() => artifactBundles.id),
    submitGateRequired: integer("submit_gate_required", { mode: "boolean" }).notNull().default(true),
    createdAt,
    updatedAt
  },
  (table) => ({
    queueLeaseIdx: index("queue_job_lease_idx").on(table.queueName, table.schedulerStatus, table.hostBucket),
    priorityIdx: index("queue_job_priority_idx").on(table.queuePriority, table.createdAt)
  })
);

export const executionAttempts = sqliteTable("execution_attempt", {
  id: text("id").primaryKey(),
  jobPostingId: text("job_posting_id").notNull().references(() => jobPostings.id),
  artifactBundleId: text("artifact_bundle_id").references(() => artifactBundles.id),
  queueJobId: text("queue_job_id").notNull().references(() => queueJobs.id),
  host: text("host").notNull(),
  hostBucket: text("host_bucket").notNull(),
  laneType: text("lane_type").notNull(),
  executionMode: text("execution_mode").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  workflowState: text("workflow_state").notNull(),
  currentStep: text("current_step"),
  dryRun: integer("dry_run", { mode: "boolean" }).notNull(),
  approvalScope: text("approval_scope").notNull(),
  startedAt: text("started_at").notNull(),
  updatedAt,
  completedAt: text("completed_at"),
  result: text("result"),
  failureReason: text("failure_reason"),
  finalReviewDecisionId: text("final_review_decision_id").references(() => reviewDecisions.id)
});

export const submissionEvents = sqliteTable("submission_event", {
  id: text("id").primaryKey(),
  executionAttemptId: text("execution_attempt_id").notNull().references(() => executionAttempts.id),
  jobPostingId: text("job_posting_id").notNull().references(() => jobPostings.id),
  eventType: text("event_type").notNull(),
  eventPayloadJson: text("event_payload_json").notNull().default("{}"),
  artifactPath: text("artifact_path"),
  screenshotPath: text("screenshot_path"),
  domSnapshotPath: text("dom_snapshot_path"),
  createdAt
});

export const retryEvents = sqliteTable("retry_event", {
  id: text("id").primaryKey(),
  queueJobId: text("queue_job_id").notNull().references(() => queueJobs.id),
  executionAttemptId: text("execution_attempt_id").references(() => executionAttempts.id),
  host: text("host").notNull(),
  retryReason: text("retry_reason").notNull(),
  retryCount: integer("retry_count").notNull(),
  backoffSeconds: integer("backoff_seconds").notNull(),
  scheduledFor: text("scheduled_for").notNull(),
  createdAt
});

export const deadLetterEvents = sqliteTable("dead_letter_event", {
  id: text("id").primaryKey(),
  queueJobId: text("queue_job_id").notNull().references(() => queueJobs.id),
  jobPostingId: text("job_posting_id").notNull().references(() => jobPostings.id),
  host: text("host").notNull(),
  laneType: text("lane_type").notNull(),
  executionMode: text("execution_mode").notNull(),
  reasonCode: text("reason_code").notNull(),
  reasonSummary: text("reason_summary").notNull(),
  lastErrorSnapshotPath: text("last_error_snapshot_path"),
  createdAt
});

export const hostHealthSnapshots = sqliteTable("host_health_snapshot", {
  id: text("id").primaryKey(),
  host: text("host").notNull(),
  windowStart: text("window_start").notNull(),
  windowEnd: text("window_end").notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  retryCount: integer("retry_count").notNull().default(0),
  deadLetterCount: integer("dead_letter_count").notNull().default(0),
  captchaCount: integer("captcha_count").notNull().default(0),
  medianDurationMs: integer("median_duration_ms"),
  effectiveConcurrency: integer("effective_concurrency").notNull().default(1),
  effectiveRateLimit: integer("effective_rate_limit").notNull().default(1),
  healthStatus: text("health_status").notNull().default("healthy"),
  createdAt
});

export const applicationDuplicateIndex = sqliteTable(
  "application_duplicate_index",
  {
    id: text("id").primaryKey(),
    jobPostingId: text("job_posting_id").notNull().references(() => jobPostings.id),
    canonicalUrlHash: text("canonical_url_hash"),
    contentHash: text("content_hash"),
    companyName: text("company_name"),
    jobTitle: text("job_title"),
    firstSeenAt: text("first_seen_at").notNull(),
    lastSeenAt: text("last_seen_at").notNull()
  },
  (table) => ({
    urlHashIdx: index("application_duplicate_index_url_hash_idx").on(table.canonicalUrlHash),
    contentHashIdx: index("application_duplicate_index_content_hash_idx").on(table.contentHash)
  })
);

export const schema = {
  applicationDuplicateIndex,
  approvalPolicies,
  artifactBundles,
  auditEvents,
  batchRuns,
  deadLetterEvents,
  evidenceItems,
  executionAttempts,
  executionPolicies,
  experienceBank,
  extractedRequirements,
  fitScores,
  hostCapabilityProfiles,
  hostHealthSnapshots,
  jobPostings,
  laneRouteDecisions,
  masterProfiles,
  migrationState,
  projectBank,
  queueJobs,
  retryEvents,
  reviewDecisions,
  runMetadata,
  submissionEvents
} as const;

export type BatchRunRow = InferSelectModel<typeof batchRuns>;
export type InsertBatchRun = InferInsertModel<typeof batchRuns>;
export type JobPostingRow = InferSelectModel<typeof jobPostings>;
export type InsertJobPosting = InferInsertModel<typeof jobPostings>;
export type QueueJobRow = InferSelectModel<typeof queueJobs>;
export type InsertQueueJob = InferInsertModel<typeof queueJobs>;
export type RunMetadataRow = InferSelectModel<typeof runMetadata>;
export type InsertRunMetadata = InferInsertModel<typeof runMetadata>;
export type AuditEventRow = InferSelectModel<typeof auditEvents>;
export type InsertAuditEvent = InferInsertModel<typeof auditEvents>;

export const databaseSchemaStatus = "foundation-implemented" as const;
