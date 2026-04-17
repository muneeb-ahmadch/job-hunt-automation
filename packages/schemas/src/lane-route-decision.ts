import { Type, type Static } from "@sinclair/typebox";

import {
  approvalScopeSchema,
  confidenceSchema,
  executionModeSchema,
  hostRiskTierSchema,
  hostTypeSchema,
  laneTypeSchema
} from "./common";

export const laneRouteDecisionSchema = Type.Object(
  {
    lane_type: laneTypeSchema,
    execution_mode: executionModeSchema,
    host_type: hostTypeSchema,
    host_risk_tier: hostRiskTierSchema,
    approval_scope: approvalScopeSchema,
    submit_gate_required: Type.Boolean(),
    batch_safe: Type.Boolean(),
    fragility_score: confidenceSchema,
    reasoning: Type.Array(Type.String())
  },
  {
    $id: "lane-route-decision.schema.json",
    additionalProperties: false
  }
);

export type LaneRouteDecisionOutput = Static<typeof laneRouteDecisionSchema>;
