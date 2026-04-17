import { executionModes, laneTypes, schemaRegistry } from "@job-hunt/schemas";

export * from "./config";
export * from "./env";
export * from "./jsonc";
export * from "./logger";
export * from "./runtime";
export * from "./storage";

export const coreScaffold = {
  packageName: "@job-hunt/core",
  purpose: "Deterministic normalization, scoring, routing, duplicate detection, policy math, runtime config, and retry helpers",
  laneTypes,
  executionModes,
  schemaContracts: Object.keys(schemaRegistry).length
} as const;
