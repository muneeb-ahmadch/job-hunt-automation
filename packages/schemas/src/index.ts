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

export const scaffoldContract = {
  packageName: "@job-hunt/schemas",
  purpose: "Shared schema and enum contracts from plan.md",
  sourceOfTruth: "plan.md"
} as const;
