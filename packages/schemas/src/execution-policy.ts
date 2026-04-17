import { Type, type Static } from "@sinclair/typebox";

import { approvalScopeSchema, executionModeSchema, hostRiskTierSchema, laneTypeSchema } from "./common";
import { uploadStrategySchema } from "./host-capability-profile";

export const retryPolicySchema = Type.Object(
  {
    max_retries: Type.Integer({ minimum: 0, maximum: 10 }),
    backoff_seconds: Type.Array(Type.Integer({ minimum: 1 }))
  },
  { additionalProperties: false }
);

export const timeoutPolicySchema = Type.Object(
  {
    page_load_ms: Type.Integer({ minimum: 1000 }),
    step_ms: Type.Integer({ minimum: 1000 })
  },
  { additionalProperties: false }
);

export const executionPolicySchema = Type.Object(
  {
    policy_key: Type.String({ minLength: 1 }),
    lane_type: laneTypeSchema,
    host_risk_tier: hostRiskTierSchema,
    execution_mode: executionModeSchema,
    max_concurrency: Type.Integer({ minimum: 1, maximum: 10 }),
    rate_limit_per_minute: Type.Integer({ minimum: 1, maximum: 120 }),
    approval_scope: approvalScopeSchema,
    submit_mode: approvalScopeSchema,
    retry_policy: retryPolicySchema,
    captcha_policy: Type.Union([
      Type.Literal("pause_and_wait"),
      Type.Literal("manual_takeover"),
      Type.Literal("dead_letter")
    ]),
    timeout_policy: timeoutPolicySchema,
    upload_policy: uploadStrategySchema,
    answer_policy: Type.Optional(Type.String()),
    manual_takeover_threshold: Type.Optional(Type.Number({ minimum: 0, maximum: 1 }))
  },
  {
    $id: "execution-policy.schema.json",
    additionalProperties: false
  }
);

export type ExecutionPolicy = Static<typeof executionPolicySchema>;

export const executionPoliciesConfigSchema = Type.Object(
  {
    $schema: Type.Optional(Type.String()),
    policies: Type.Array(executionPolicySchema, { minItems: 1 })
  },
  {
    $id: "execution-policies-config.schema.json",
    additionalProperties: false
  }
);

export type ExecutionPoliciesConfig = Static<typeof executionPoliciesConfigSchema>;
