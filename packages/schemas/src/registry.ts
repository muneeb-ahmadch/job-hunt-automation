import { appConfigSchema } from "./app-config";
import { approvalPoliciesConfigSchema, approvalPolicySchema } from "./approval-policy";
import { artifactBundleSchema } from "./artifact-bundle";
import { batchRunSchema } from "./batch-run";
import { executionPoliciesConfigSchema, executionPolicySchema } from "./execution-policy";
import { fitScoringOutputSchema } from "./fit-scoring";
import { hostCapabilitiesConfigSchema, hostCapabilityProfileSchema } from "./host-capability-profile";
import { jobExtractionOutputSchema } from "./job-extraction";
import { laneRouteDecisionSchema } from "./lane-route-decision";
import { queueJobSchema } from "./queue-job";
import { resumePlanOutputSchema } from "./resume-plan";
import { reviewDecisionOutputSchema } from "./review-decision";
import { screeningAnswerOutputSchema } from "./screening-answer";

export const schemaRegistry = {
  appConfig: appConfigSchema,
  approvalPoliciesConfig: approvalPoliciesConfigSchema,
  approvalPolicy: approvalPolicySchema,
  artifactBundle: artifactBundleSchema,
  batchRun: batchRunSchema,
  executionPoliciesConfig: executionPoliciesConfigSchema,
  executionPolicy: executionPolicySchema,
  fitScoringOutput: fitScoringOutputSchema,
  hostCapabilitiesConfig: hostCapabilitiesConfigSchema,
  hostCapabilityProfile: hostCapabilityProfileSchema,
  jobExtractionOutput: jobExtractionOutputSchema,
  laneRouteDecision: laneRouteDecisionSchema,
  queueJob: queueJobSchema,
  resumePlanOutput: resumePlanOutputSchema,
  reviewDecisionOutput: reviewDecisionOutputSchema,
  screeningAnswerOutput: screeningAnswerOutputSchema
} as const;

export type SchemaRegistryKey = keyof typeof schemaRegistry;
