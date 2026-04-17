import { readJsoncFile } from "@job-hunt/core";
import {
  approvalPoliciesConfigSchema,
  assertValid,
  type ApprovalPoliciesConfig,
  type ApprovalPolicy,
  type HostRiskTier,
  type LaneType
} from "@job-hunt/schemas";

export const approvalPoliciesStatus = "config-backed-foundation" as const;

export interface ApprovalPolicyRegistry {
  policies: ApprovalPolicy[];
}

export function loadApprovalPolicyRegistry(rootDir = process.cwd()): ApprovalPolicyRegistry {
  const config = assertValid(
    approvalPoliciesConfigSchema,
    readJsoncFile("config/approval-policies.jsonc", rootDir)
  ) as ApprovalPoliciesConfig;

  return {
    policies: config.policies
  };
}

export function resolveApprovalPolicy(
  registry: ApprovalPolicyRegistry,
  input: {
    laneType: LaneType;
    hostRiskTier: HostRiskTier;
  }
): ApprovalPolicy | null {
  return (
    registry.policies.find(
      (policy) => policy.lane_type === input.laneType && policy.host_risk_tier === input.hostRiskTier
    ) ??
    registry.policies.find((policy) => policy.policy_key === "manual-fallback-high-risk") ??
    null
  );
}
