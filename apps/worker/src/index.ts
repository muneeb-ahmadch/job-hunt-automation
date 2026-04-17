import { pathToFileURL } from "node:url";

import { coreScaffold, initializeRuntime } from "@job-hunt/core";
import { createDatabaseClient, listAppliedMigrations } from "@job-hunt/db";
import {
  loadApprovalPolicyRegistry,
  loadExecutionPolicyRegistry,
  loadHostCapabilityRegistry
} from "@job-hunt/registry";
import { executionModes, laneTypes } from "@job-hunt/schemas";

export function getWorkerStatus(): string {
  const runtime = initializeRuntime({ component: "worker" });
  const hostCapabilities = loadHostCapabilityRegistry(runtime.config.rootDir);
  const executionPolicies = loadExecutionPolicyRegistry(runtime.config.rootDir);
  const approvalPolicies = loadApprovalPolicyRegistry(runtime.config.rootDir);
  const client = createDatabaseClient({
    databaseUrl: runtime.config.storage.databaseUrl,
    rootDir: runtime.config.rootDir
  });

  const migrations = listAppliedMigrations(client.sqlite);
  client.close();

  return [
    "job-hunt worker foundation",
    `core=${coreScaffold.packageName}`,
    `lanes=${laneTypes.length}`,
    `executionModes=${executionModes.length}`,
    `hosts=${hostCapabilities.profiles.length}`,
    `executionPolicies=${executionPolicies.policies.length}`,
    `approvalPolicies=${approvalPolicies.policies.length}`,
    `migrations=${migrations.length}`,
    `dryRun=${runtime.config.dryRun}`,
    "liveExecution=disabled"
  ].join(" ");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(getWorkerStatus());
}
