import { readJsoncFile } from "@job-hunt/core";
import {
  assertValid,
  executionPoliciesConfigSchema,
  type ExecutionPoliciesConfig,
  type ExecutionPolicy,
  type ExecutionMode,
  type HostRiskTier,
  type LaneType
} from "@job-hunt/schemas";

export const executionPoliciesStatus = "config-backed-foundation" as const;

export interface ExecutionPolicyRegistry {
  policies: ExecutionPolicy[];
}

export function loadExecutionPolicyRegistry(rootDir = process.cwd()): ExecutionPolicyRegistry {
  const config = assertValid(
    executionPoliciesConfigSchema,
    readJsoncFile("config/execution-policies.jsonc", rootDir)
  ) as ExecutionPoliciesConfig;

  return {
    policies: config.policies
  };
}

export function resolveExecutionPolicy(
  registry: ExecutionPolicyRegistry,
  input: {
    laneType: LaneType;
    hostRiskTier: HostRiskTier;
    executionMode: ExecutionMode;
  }
): ExecutionPolicy | null {
  return (
    registry.policies.find(
      (policy) =>
        policy.lane_type === input.laneType &&
        policy.host_risk_tier === input.hostRiskTier &&
        policy.execution_mode === input.executionMode
    ) ??
    registry.policies.find(
      (policy) => policy.lane_type === input.laneType && policy.host_risk_tier === input.hostRiskTier
    ) ??
    registry.policies.find((policy) => policy.policy_key === "manual-only") ??
    null
  );
}
