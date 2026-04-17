export * from "./dead-letter";
export * from "./fairness";
export * from "./host-buckets";
export * from "./lease-manager";
export * from "./metrics";
export * from "./queue-manager";
export * from "./retry-queue";

export const schedulerScaffold = {
  packageName: "@job-hunt/scheduler",
  purpose: "SQLite-backed queue leasing, host buckets, fairness, retry, dead-letter, and metrics",
  status: "foundation-implemented"
} as const;
