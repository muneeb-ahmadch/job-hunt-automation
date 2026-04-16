export const promptFiles = [
  "jd-extraction.md",
  "fit-scoring.md",
  "lane-routing.md",
  "resume-tailoring.md",
  "short-answer.md",
  "evidence-check.md",
  "unsupported-claim-check.md",
  "execution-planning.md"
] as const;

export const promptsScaffold = {
  packageName: "@job-hunt/prompts",
  purpose: "Versioned narrow prompts copied from plan.md appendices"
} as const;
