import type {
  ApprovalPoliciesConfig,
  AppConfig,
  BatchRunContract,
  ExecutionPoliciesConfig,
  FitScoringOutput,
  HostCapabilitiesConfig,
  JobExtractionOutput,
  LaneRouteDecisionOutput,
  QueueJobContract,
  ResumePlanOutput,
  ReviewDecisionOutput,
  ScreeningAnswerOutput
} from "../../../packages/schemas/src/index";

export const validAppConfig: AppConfig = {
  runtime: {
    environment: "test",
    dryRun: true,
    defaultBrowserHeaded: true,
    timezone: "local"
  },
  storage: {
    databaseUrlEnv: "DATABASE_URL",
    artifactRootEnv: "ARTIFACT_ROOT",
    rawImportRootEnv: "RAW_IMPORT_ROOT",
    screenshotRootEnv: "SCREENSHOT_ROOT",
    domSnapshotRootEnv: "DOM_SNAPSHOT_ROOT",
    traceRootEnv: "TRACE_ROOT",
    logRootEnv: "LOG_ROOT",
    browserProfileDirEnv: "BROWSER_PROFILE_DIR"
  },
  openai: {
    apiKeyEnv: "OPENAI_API_KEY",
    defaultModelEnv: "OPENAI_DEFAULT_MODEL",
    smallModelEnv: "OPENAI_SMALL_MODEL",
    strongModelEnv: "OPENAI_STRONG_MODEL"
  },
  costControls: {
    enableCaching: true,
    skipCoverLetterByDefault: true,
    onlyGenerateArtifactsForTopPercent: 20,
    onlyGenerateAnswersOnDemand: true,
    monthlySoftUsdCapEnv: "MONTHLY_SOFT_USD_CAP"
  },
  routing: {
    mustHaveCoverageStrongSkipBelow: 45,
    prioritySkipBelow: 55,
    priorityConsiderBelow: 70,
    artifactCandidateAtOrAbove: 70,
    executionPriorityAtOrAbove: 78
  },
  security: {
    redactLogs: true,
    sendCookiesToModels: false,
    sendPasswordsToModels: false,
    sendTokensToModels: false
  },
  logging: {
    levelEnv: "LOG_LEVEL",
    logToFile: false,
    redact: true
  }
};

export const validJobExtraction: JobExtractionOutput = {
  job_title: "Frontend Engineer",
  company_name: "Example Systems",
  seniority_level: "mid",
  employment_type: "full_time",
  remote_expectation: "remote",
  must_have_skills: [
    {
      raw_term: "TypeScript",
      normalized_skill_id: "typescript",
      importance: "must_have"
    }
  ],
  nice_to_have_skills: [],
  responsibilities: ["Build accessible UI"],
  keywords: ["React"],
  tools: ["TypeScript"],
  location_constraints: [],
  work_auth_requirements: [],
  compensation_signals: [],
  domain_signals: [],
  education_requirements: [],
  red_flags: [],
  parse_confidence: 0.9
};

export const validFitScore: FitScoringOutput = {
  overall_score: 82,
  skill_match_score: 85,
  title_match_score: 80,
  seniority_match_score: 75,
  remote_match_score: 100,
  stack_alignment_score: 84,
  application_friction_score: 20,
  resume_match_confidence_score: 80,
  lane_suitability_score: 90,
  host_execution_score: 90,
  matched_strengths: ["TypeScript"],
  missing_must_haves: [],
  disqualifier_flags: [],
  recommendation: "apply",
  reasoning: ["Strong local dry-run fixture"]
};

export const validLaneRoute: LaneRouteDecisionOutput = {
  lane_type: "ats_lane",
  execution_mode: "ats_adapter_execution",
  host_type: "greenhouse",
  host_risk_tier: "low",
  approval_scope: "per_batch",
  submit_gate_required: true,
  batch_safe: true,
  fragility_score: 0.2,
  reasoning: ["Known host profile"]
};

export const validHostCapabilities: HostCapabilitiesConfig = {
  profiles: [
    {
      host: "generic",
      site_type: "generic",
      supports_public_job_fetch: false,
      supports_api_apply: false,
      supports_adapter_apply: false,
      requires_browser: true,
      fragility_score: 0.6,
      approval_strictness: "medium",
      authentication_burden: "medium",
      batch_safe: false,
      default_max_concurrency: 1,
      default_rate_limit_per_minute: 6,
      cool_off_seconds: 120,
      captcha_likelihood: 0.15,
      upload_strategy: "review_required",
      notes: "fixture"
    }
  ]
};

export const validExecutionPolicies: ExecutionPoliciesConfig = {
  policies: [
    {
      policy_key: "fixture-policy",
      lane_type: "ats_lane",
      host_risk_tier: "low",
      execution_mode: "ats_adapter_execution",
      max_concurrency: 1,
      rate_limit_per_minute: 6,
      approval_scope: "per_batch",
      submit_mode: "per_batch",
      retry_policy: {
        max_retries: 1,
        backoff_seconds: [60]
      },
      captcha_policy: "pause_and_wait",
      timeout_policy: {
        page_load_ms: 30000,
        step_ms: 10000
      },
      upload_policy: "auto_if_approved"
    }
  ]
};

export const validApprovalPolicies: ApprovalPoliciesConfig = {
  policies: [
    {
      policy_key: "fixture-approval",
      lane_type: "ats_lane",
      host_risk_tier: "low",
      artifact_review_scope: "per_batch",
      answer_review_scope: "per_batch",
      submit_review_scope: "per_batch",
      allow_batch_artifact_approval: true,
      allow_batch_submit_approval: true,
      requires_manual_submit_preview: false,
      requires_new_answer_review: true
    }
  ]
};

export const validBatchRun: BatchRunContract = {
  batch_type: "intake",
  status: "created",
  source_label: "fixture",
  input_count: 1,
  deduped_count: 1,
  scored_count: 0,
  skipped_count: 0,
  artifacts_queued_count: 0,
  execution_ready_count: 0,
  submitted_count: 0,
  failed_count: 0,
  dead_letter_count: 0
};

export const validQueueJob: QueueJobContract = {
  batch_id: "batch_fixture",
  job_posting_id: "job_fixture",
  queue_name: "score",
  lane_type: "ats_lane",
  execution_mode: "ats_adapter_execution",
  queue_priority: 500,
  scheduler_status: "queued",
  host_bucket: "greenhouse:boards.greenhouse.io",
  retry_count: 0,
  next_retry_at: null,
  artifact_bundle_id: null,
  submit_gate_required: true
};

export const validResumePlan: ResumePlanOutput = {
  output_mode: "application",
  is_submittable: false,
  target_role_positioning: "Frontend role",
  section_order: ["summary", "skills", "experience"],
  selected_experience_ids: ["exp_fixture"],
  selected_project_ids: [],
  priority_keywords: ["TypeScript"],
  placeholders: [],
  gap_map: [],
  warnings: []
};

export const validScreeningAnswer: ScreeningAnswerOutput = {
  canonical_question_key: "work_authorization",
  question_text: "Are you authorized to work?",
  answer_text: "Requires manual confirmation.",
  answer_type: "short_text",
  confidence: 0.7,
  source_ids: ["profile_fixture"],
  requires_manual_review: true,
  cacheability: "manual_only",
  notes: "fixture"
};

export const validReviewDecision: ReviewDecisionOutput = {
  scope_type: "job",
  entity_type: "fit_decision",
  entity_id: "job_fixture",
  decision: "paused",
  review_notes: "Needs review",
  edited_payload: null
};

export const invalidFixtures = {
  jobExtractionMissingTitle: {
    ...validJobExtraction,
    job_title: undefined
  },
  fitScoreOutOfRange: {
    ...validFitScore,
    overall_score: 101
  },
  routeUnsupportedMode: {
    ...validLaneRoute,
    execution_mode: "linkedin_bulk"
  },
  queueNegativeRetry: {
    ...validQueueJob,
    retry_count: -1
  }
} as const;
