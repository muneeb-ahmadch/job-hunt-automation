import { describe, expect, it } from "vitest";

import { loadRuntimeConfig } from "../../packages/core/src/index";
import {
  loadApprovalPolicyRegistry,
  loadExecutionPolicyRegistry,
  loadHostCapabilityRegistry,
  resolveHostCapability
} from "../../packages/registry/src/index";

describe("runtime config", () => {
  it("validates app config and policy registries before startup", () => {
    const runtime = loadRuntimeConfig({ loadEnvFile: false });
    const hosts = loadHostCapabilityRegistry(runtime.rootDir);
    const executionPolicies = loadExecutionPolicyRegistry(runtime.rootDir);
    const approvalPolicies = loadApprovalPolicyRegistry(runtime.rootDir);

    expect(runtime.dryRun).toBe(true);
    expect(runtime.app.security.sendCookiesToModels).toBe(false);
    expect(hosts.profiles.length).toBeGreaterThan(0);
    expect(executionPolicies.policies.length).toBeGreaterThan(0);
    expect(approvalPolicies.policies.length).toBeGreaterThan(0);
    expect(resolveHostCapability(hosts, "boards.greenhouse.io").site_type).toBe("greenhouse");
  });
});
