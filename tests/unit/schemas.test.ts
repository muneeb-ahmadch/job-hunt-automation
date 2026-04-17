import { describe, expect, it } from "vitest";

import { compileSchema, schemaRegistry } from "../../packages/schemas/src/index";
import {
  invalidFixtures,
  validAppConfig,
  validApprovalPolicies,
  validBatchRun,
  validExecutionPolicies,
  validFitScore,
  validHostCapabilities,
  validJobExtraction,
  validLaneRoute,
  validQueueJob,
  validResumePlan,
  validReviewDecision,
  validScreeningAnswer
} from "../fixtures/schemas/foundation-fixtures";

describe("foundation schema contracts", () => {
  it("accepts valid examples for the milestone foundation contracts", () => {
    const validBySchema = [
      [schemaRegistry.appConfig, validAppConfig],
      [schemaRegistry.approvalPoliciesConfig, validApprovalPolicies],
      [schemaRegistry.batchRun, validBatchRun],
      [schemaRegistry.executionPoliciesConfig, validExecutionPolicies],
      [schemaRegistry.fitScoringOutput, validFitScore],
      [schemaRegistry.hostCapabilitiesConfig, validHostCapabilities],
      [schemaRegistry.jobExtractionOutput, validJobExtraction],
      [schemaRegistry.laneRouteDecision, validLaneRoute],
      [schemaRegistry.queueJob, validQueueJob],
      [schemaRegistry.resumePlanOutput, validResumePlan],
      [schemaRegistry.reviewDecisionOutput, validReviewDecision],
      [schemaRegistry.screeningAnswerOutput, validScreeningAnswer]
    ] as const;

    for (const [schema, fixture] of validBySchema) {
      expect(compileSchema(schema).validate(fixture), schema.$id).toMatchObject({ ok: true });
    }
  });

  it("rejects invalid examples instead of accepting unsafe model or queue output", () => {
    expect(compileSchema(schemaRegistry.jobExtractionOutput).validate(invalidFixtures.jobExtractionMissingTitle).ok).toBe(
      false
    );
    expect(compileSchema(schemaRegistry.fitScoringOutput).validate(invalidFixtures.fitScoreOutOfRange).ok).toBe(false);
    expect(compileSchema(schemaRegistry.laneRouteDecision).validate(invalidFixtures.routeUnsupportedMode).ok).toBe(
      false
    );
    expect(compileSchema(schemaRegistry.queueJob).validate(invalidFixtures.queueNegativeRetry).ok).toBe(false);
  });
});
