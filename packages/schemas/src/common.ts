import { Type, type TBoolean, type TInteger, type TLiteral, type TNumber, type TSchema, type TString } from "@sinclair/typebox";

export const laneTypes = [
  "linkedin_restricted",
  "ats_lane",
  "manual_fallback",
  "unsupported"
] as const;

export type LaneType = (typeof laneTypes)[number];

export const executionModes = [
  "ats_api_first",
  "ats_adapter_execution",
  "browser_fallback",
  "manual_only"
] as const;

export type ExecutionMode = (typeof executionModes)[number];

export const routeResults = [
  "linkedin_restricted",
  "ats_api_first",
  "ats_adapter_execution",
  "browser_fallback",
  "manual_only"
] as const;

export type RouteResult = (typeof routeResults)[number];

export const workflowStates = [
  "imported",
  "normalized",
  "extracted",
  "scored",
  "routed_to_lane",
  "queued_for_artifacts",
  "artifacts_ready",
  "awaiting_batch_review",
  "approved_for_execution",
  "executing",
  "awaiting_submit_gate",
  "submitted",
  "failed",
  "dead_lettered",
  "manual_takeover",
  "linkedin_assist_only",
  "ats_api_submitted",
  "ats_browser_submitted"
] as const;

export type WorkflowState = (typeof workflowStates)[number];

export const schedulerStates = [
  "queued",
  "leased",
  "running",
  "paused",
  "retry_scheduled",
  "cool_off",
  "dead_lettered",
  "completed",
  "cancelled"
] as const;

export type SchedulerState = (typeof schedulerStates)[number];

export const outputModes = ["application", "benchmark"] as const;

export type OutputMode = (typeof outputModes)[number];

export const queueNames = ["normalize", "score", "artifacts", "execution", "retry", "manual"] as const;

export type QueueName = (typeof queueNames)[number];

export const hostTypes = ["linkedin", "greenhouse", "lever", "workday", "generic", "custom_api", "unknown"] as const;

export type HostType = (typeof hostTypes)[number];

export const hostRiskTiers = ["low", "medium", "high"] as const;

export type HostRiskTier = (typeof hostRiskTiers)[number];

export const approvalScopes = ["per_job", "per_batch"] as const;

export type ApprovalScope = (typeof approvalScopes)[number];

export const batchTypes = ["intake", "scoring", "artifacts", "execution", "retry_reprocess"] as const;

export type BatchType = (typeof batchTypes)[number];

export const batchStatuses = ["created", "running", "paused", "completed", "failed", "cancelled"] as const;

export type BatchStatus = (typeof batchStatuses)[number];

export const reviewScopeTypes = ["job", "batch", "artifact_bundle", "host_bucket"] as const;

export type ReviewScopeType = (typeof reviewScopeTypes)[number];

export const reviewEntityTypes = ["resume", "answer_set", "upload", "submit", "fit_decision", "batch_review"] as const;

export type ReviewEntityType = (typeof reviewEntityTypes)[number];

export const reviewDecisions = ["approved", "rejected", "edited", "skipped", "paused"] as const;

export type ReviewDecisionValue = (typeof reviewDecisions)[number];

export const artifactStatuses = ["planned", "generated", "blocked", "approved", "rejected", "expired"] as const;

export type ArtifactStatus = (typeof artifactStatuses)[number];

export const approvalStatuses = ["pending", "approved", "rejected", "expired"] as const;

export type ApprovalStatus = (typeof approvalStatuses)[number];

export function stringEnumSchema<const T extends readonly string[]>(values: T): TSchema {
  return Type.Union(values.map((value) => Type.Literal(value)) as [TLiteral<string>, TLiteral<string>, ...TLiteral<string>[]]);
}

export const laneTypeSchema = stringEnumSchema(laneTypes);
export const executionModeSchema = stringEnumSchema(executionModes);
export const workflowStateSchema = stringEnumSchema(workflowStates);
export const schedulerStateSchema = stringEnumSchema(schedulerStates);
export const outputModeSchema = stringEnumSchema(outputModes);
export const queueNameSchema = stringEnumSchema(queueNames);
export const hostTypeSchema = stringEnumSchema(hostTypes);
export const hostRiskTierSchema = stringEnumSchema(hostRiskTiers);
export const approvalScopeSchema = stringEnumSchema(approvalScopes);
export const batchTypeSchema = stringEnumSchema(batchTypes);
export const batchStatusSchema = stringEnumSchema(batchStatuses);
export const reviewScopeTypeSchema = stringEnumSchema(reviewScopeTypes);
export const reviewEntityTypeSchema = stringEnumSchema(reviewEntityTypes);
export const reviewDecisionValueSchema = stringEnumSchema(reviewDecisions);
export const artifactStatusSchema = stringEnumSchema(artifactStatuses);
export const approvalStatusSchema = stringEnumSchema(approvalStatuses);

export const idSchema: TString = Type.String({ minLength: 1 });
export const nonEmptyStringSchema: TString = Type.String({ minLength: 1 });
export const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);
export const dateTimeStringSchema: TString = Type.String({ minLength: 1 });
export const score100Schema: TNumber = Type.Number({ minimum: 0, maximum: 100 });
export const confidenceSchema: TNumber = Type.Number({ minimum: 0, maximum: 1 });
export const booleanSchema: TBoolean = Type.Boolean();
export const positiveIntegerSchema: TInteger = Type.Integer({ minimum: 1 });
export const nonNegativeIntegerSchema: TInteger = Type.Integer({ minimum: 0 });
