import type {
  ApprovalScope,
  ApprovalStatus,
  ArtifactStatus,
  BatchStatus,
  BatchType,
  ExecutionMode,
  HostRiskTier,
  HostType,
  LaneType,
  OutputMode,
  QueueName,
  SchedulerState,
  WorkflowState
} from "./common";

export interface BatchRun {
  id: string;
  batchType: BatchType;
  status: BatchStatus;
  sourceLabel: string | null;
  inputCount: number;
  dedupedCount: number;
  scoredCount: number;
  skippedCount: number;
  artifactsQueuedCount: number;
  executionReadyCount: number;
  submittedCount: number;
  failedCount: number;
  deadLetterCount: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface JobPosting {
  id: string;
  batchId: string | null;
  sourceType: "pasted_text" | "linkedin_url" | "ats_url" | "company_url" | "csv" | "manual";
  sourceUrl: string | null;
  sourceHost: string | null;
  externalJobId: string | null;
  canonicalUrlHash: string | null;
  companyName: string | null;
  jobTitle: string | null;
  rawText: string | null;
  normalizedText: string | null;
  contentHash: string | null;
  importStatus: string;
  laneType: LaneType | null;
  executionMode: ExecutionMode | null;
  hostRiskTier: HostRiskTier | null;
  queuePriority: number;
  schedulerStatus: SchedulerState;
  duplicateStatus: "unknown" | "unique" | "duplicate" | "possible_duplicate";
  createdAt: string;
  updatedAt: string;
}

export interface LaneRouteDecision {
  id: string;
  jobPostingId: string;
  laneType: LaneType;
  executionMode: ExecutionMode;
  hostType: HostType;
  hostRiskTier: HostRiskTier;
  approvalScope: ApprovalScope;
  submitGateRequired: boolean;
  batchSafe: boolean;
  fragilityScore: number;
  requiresLogin: boolean;
  createdAt: string;
}

export interface ArtifactBundle {
  id: string;
  jobPostingId: string;
  batchId: string;
  outputMode: OutputMode;
  isSubmittable: boolean;
  artifactHash: string;
  artifactStatus: ArtifactStatus;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QueueJob {
  id: string;
  batchId: string;
  jobPostingId: string;
  queueName: QueueName;
  laneType: LaneType;
  executionMode: ExecutionMode;
  queuePriority: number;
  schedulerStatus: SchedulerState;
  hostBucket: string;
  leaseToken: string | null;
  leaseExpiresAt: string | null;
  retryCount: number;
  nextRetryAt: string | null;
  lastErrorCode: string | null;
  lastErrorSummary: string | null;
  artifactBundleId: string | null;
  submitGateRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionAttempt {
  id: string;
  jobPostingId: string;
  artifactBundleId: string | null;
  queueJobId: string;
  host: string;
  hostBucket: string;
  laneType: LaneType;
  executionMode: ExecutionMode;
  attemptNumber: number;
  workflowState: WorkflowState;
  currentStep: string | null;
  dryRun: boolean;
  approvalScope: ApprovalScope;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  result: "submitted" | "manual_completed" | "failed" | "aborted" | null;
  failureReason: string | null;
  finalReviewDecisionId: string | null;
}
