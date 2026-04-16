import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { executionModes, laneTypes, outputModes, workflowStates } from "../../packages/schemas/src/index";

describe("phase 0 scaffold", () => {
  it("captures the lane and execution contracts from plan.md", () => {
    expect(laneTypes).toEqual(["linkedin_restricted", "ats_lane", "manual_fallback", "unsupported"]);
    expect(executionModes).toEqual([
      "ats_api_first",
      "ats_adapter_execution",
      "browser_fallback",
      "manual_only"
    ]);
    expect(outputModes).toEqual(["application", "benchmark"]);
    expect(workflowStates).toContain("awaiting_submit_gate");
  });

  it("includes the required implementation-lead docs", () => {
    for (const path of ["AGENTS.md", "docs/architecture.md", "docs/build-roadmap.md", "docs/todo.md"]) {
      expect(existsSync(join(process.cwd(), path))).toBe(true);
    }
  });
});
