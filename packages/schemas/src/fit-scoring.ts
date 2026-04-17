import { Type, type Static } from "@sinclair/typebox";

import { score100Schema } from "./common";

export const fitRecommendations = ["apply", "consider", "skip"] as const;
export type FitRecommendation = (typeof fitRecommendations)[number];

export const fitScoringOutputSchema = Type.Object(
  {
    overall_score: score100Schema,
    skill_match_score: score100Schema,
    title_match_score: score100Schema,
    seniority_match_score: score100Schema,
    remote_match_score: score100Schema,
    stack_alignment_score: score100Schema,
    application_friction_score: score100Schema,
    resume_match_confidence_score: score100Schema,
    lane_suitability_score: score100Schema,
    host_execution_score: score100Schema,
    matched_strengths: Type.Array(Type.String()),
    missing_must_haves: Type.Array(Type.String()),
    disqualifier_flags: Type.Array(Type.String()),
    recommendation: Type.Union([
      Type.Literal("apply"),
      Type.Literal("consider"),
      Type.Literal("skip")
    ]),
    reasoning: Type.Array(Type.String())
  },
  {
    $id: "fit-scoring-output.schema.json",
    additionalProperties: false
  }
);

export type FitScoringOutput = Static<typeof fitScoringOutputSchema>;
