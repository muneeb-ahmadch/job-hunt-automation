import { Type, type Static } from "@sinclair/typebox";

import { outputModeSchema } from "./common";

export const resumePlaceholderSchema = Type.Object(
  {
    placeholder_text: Type.String({ minLength: 1 }),
    reason: Type.String({ minLength: 1 }),
    source_id: Type.String({ minLength: 1 })
  },
  { additionalProperties: false }
);

export const sampleStatPlanSchema = Type.Object(
  {
    sample_stat_text: Type.String({ minLength: 1 }),
    why_this_wins: Type.String({ minLength: 1 }),
    evidence_needed_to_make_real: Type.String({ minLength: 1 })
  },
  { additionalProperties: false }
);

export const resumePlanOutputSchema = Type.Object(
  {
    output_mode: outputModeSchema,
    is_submittable: Type.Boolean(),
    target_role_positioning: Type.String(),
    section_order: Type.Array(
      Type.Union([
        Type.Literal("summary"),
        Type.Literal("skills"),
        Type.Literal("experience"),
        Type.Literal("projects"),
        Type.Literal("education"),
        Type.Literal("links")
      ])
    ),
    selected_experience_ids: Type.Array(Type.String()),
    selected_project_ids: Type.Array(Type.String()),
    priority_keywords: Type.Array(Type.String()),
    placeholders: Type.Array(resumePlaceholderSchema),
    sample_stat_plan: Type.Optional(Type.Array(sampleStatPlanSchema)),
    gap_map: Type.Array(Type.String()),
    warnings: Type.Array(Type.String())
  },
  {
    $id: "resume-plan-output.schema.json",
    additionalProperties: false
  }
);

export type ResumePlanOutput = Static<typeof resumePlanOutputSchema>;
