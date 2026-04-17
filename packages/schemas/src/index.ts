export * from "./app-config";
export * from "./approval-policy";
export * from "./artifact-bundle";
export * from "./batch-run";
export * from "./common";
export * from "./domain";
export * from "./execution-policy";
export * from "./fit-scoring";
export * from "./host-capability-profile";
export * from "./job-extraction";
export * from "./lane-route-decision";
export * from "./queue-job";
export * from "./registry";
export * from "./resume-plan";
export * from "./review-decision";
export * from "./screening-answer";
export * from "./validator";

export const scaffoldContract = {
  packageName: "@job-hunt/schemas",
  purpose: "Shared TypeBox schema and enum contracts from plan.md",
  sourceOfTruth: "plan.md",
  implementedContracts: [
    "appConfig",
    "jobExtractionOutput",
    "fitScoringOutput",
    "laneRouteDecision",
    "hostCapabilityProfile",
    "executionPolicy",
    "approvalPolicy",
    "batchRun",
    "queueJob",
    "artifactBundle",
    "resumePlanOutput",
    "screeningAnswerOutput",
    "reviewDecisionOutput"
  ]
} as const;
