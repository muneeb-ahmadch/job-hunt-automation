import { Type, type Static } from "@sinclair/typebox";

import { approvalScopeSchema, hostRiskTierSchema, laneTypeSchema } from "./common";

export const approvalPolicySchema = Type.Object(
  {
    policy_key: Type.String({ minLength: 1 }),
    lane_type: laneTypeSchema,
    host_risk_tier: hostRiskTierSchema,
    artifact_review_scope: approvalScopeSchema,
    answer_review_scope: approvalScopeSchema,
    submit_review_scope: approvalScopeSchema,
    allow_batch_artifact_approval: Type.Boolean(),
    allow_batch_submit_approval: Type.Boolean(),
    requires_manual_submit_preview: Type.Boolean(),
    requires_new_answer_review: Type.Boolean()
  },
  {
    $id: "approval-policy.schema.json",
    additionalProperties: false
  }
);

export type ApprovalPolicy = Static<typeof approvalPolicySchema>;

export const approvalPoliciesConfigSchema = Type.Object(
  {
    $schema: Type.Optional(Type.String()),
    policies: Type.Array(approvalPolicySchema, { minItems: 1 })
  },
  {
    $id: "approval-policies-config.schema.json",
    additionalProperties: false
  }
);

export type ApprovalPoliciesConfig = Static<typeof approvalPoliciesConfigSchema>;
