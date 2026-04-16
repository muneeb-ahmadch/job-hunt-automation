import { executionModes, laneTypes } from "@job-hunt/schemas";

export const coreScaffold = {
  packageName: "@job-hunt/core",
  purpose: "Deterministic normalization, scoring, routing, duplicate detection, policy math, and retry helpers",
  laneTypes,
  executionModes
} as const;
