import { loadRuntimeConfig } from "@job-hunt/core";
import {
  loadApprovalPolicyRegistry,
  loadExecutionPolicyRegistry,
  loadHostCapabilityRegistry
} from "@job-hunt/registry";

const runtime = loadRuntimeConfig();
const hostCapabilities = loadHostCapabilityRegistry(runtime.rootDir);
const executionPolicies = loadExecutionPolicyRegistry(runtime.rootDir);
const approvalPolicies = loadApprovalPolicyRegistry(runtime.rootDir);

console.log(
  [
    "Validated config:",
    `environment=${runtime.app.runtime.environment}`,
    `dryRun=${runtime.dryRun}`,
    `hosts=${hostCapabilities.profiles.length}`,
    `executionPolicies=${executionPolicies.policies.length}`,
    `approvalPolicies=${approvalPolicies.policies.length}`
  ].join(" ")
);
