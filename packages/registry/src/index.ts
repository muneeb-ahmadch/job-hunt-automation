export * from "./approval-policies";
export * from "./execution-policies";
export * from "./host-capabilities";

export const registryScaffold = {
  packageName: "@job-hunt/registry",
  purpose: "Host capability, execution policy, and approval policy resolution",
  status: "config-backed-foundation"
} as const;
