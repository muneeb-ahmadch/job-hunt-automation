import { Type, type Static } from "@sinclair/typebox";

import { confidenceSchema } from "./common";

export const approvalStrictnessSchema = Type.Union([
  Type.Literal("low"),
  Type.Literal("medium"),
  Type.Literal("high")
]);

export const authenticationBurdenSchema = Type.Union([
  Type.Literal("none"),
  Type.Literal("low"),
  Type.Literal("medium"),
  Type.Literal("high")
]);

export const uploadStrategySchema = Type.Union([
  Type.Literal("auto_if_approved"),
  Type.Literal("review_required"),
  Type.Literal("manual_review"),
  Type.Literal("manual_only"),
  Type.Literal("standard"),
  Type.Literal("delayed"),
  Type.Literal("unsupported")
]);

export const hostCapabilityProfileSchema = Type.Object(
  {
    host: Type.String({ minLength: 1 }),
    site_type: Type.Union([
      Type.Literal("linkedin"),
      Type.Literal("greenhouse"),
      Type.Literal("lever"),
      Type.Literal("workday"),
      Type.Literal("generic"),
      Type.Literal("custom_api")
    ]),
    supports_public_job_fetch: Type.Boolean(),
    supports_api_apply: Type.Boolean(),
    supports_adapter_apply: Type.Boolean(),
    requires_browser: Type.Boolean(),
    fragility_score: confidenceSchema,
    approval_strictness: approvalStrictnessSchema,
    authentication_burden: authenticationBurdenSchema,
    batch_safe: Type.Boolean(),
    default_max_concurrency: Type.Integer({ minimum: 1, maximum: 10 }),
    default_rate_limit_per_minute: Type.Integer({ minimum: 1, maximum: 120 }),
    cool_off_seconds: Type.Integer({ minimum: 0 }),
    captcha_likelihood: Type.Optional(confidenceSchema),
    upload_strategy: Type.Optional(uploadStrategySchema),
    notes: Type.Optional(Type.String())
  },
  {
    $id: "host-capability-profile.schema.json",
    additionalProperties: false
  }
);

export type HostCapabilityProfile = Static<typeof hostCapabilityProfileSchema>;

export const hostCapabilitiesConfigSchema = Type.Object(
  {
    $schema: Type.Optional(Type.String()),
    profiles: Type.Array(hostCapabilityProfileSchema, { minItems: 1 })
  },
  {
    $id: "host-capabilities-config.schema.json",
    additionalProperties: false
  }
);

export type HostCapabilitiesConfig = Static<typeof hostCapabilitiesConfigSchema>;
