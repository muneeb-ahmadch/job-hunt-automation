import { Type, type Static } from "@sinclair/typebox";

import { confidenceSchema } from "./common";

export const screeningAnswerOutputSchema = Type.Object(
  {
    canonical_question_key: Type.String({ minLength: 1 }),
    question_text: Type.String({ minLength: 1 }),
    answer_text: Type.String(),
    answer_type: Type.Union([
      Type.Literal("boolean"),
      Type.Literal("short_text"),
      Type.Literal("long_text"),
      Type.Literal("numeric"),
      Type.Literal("select_option")
    ]),
    confidence: confidenceSchema,
    source_ids: Type.Array(Type.String()),
    requires_manual_review: Type.Boolean(),
    cacheability: Type.Union([
      Type.Literal("stable_reusable"),
      Type.Literal("suggest_reuse"),
      Type.Literal("manual_only")
    ]),
    notes: Type.Optional(Type.String())
  },
  {
    $id: "screening-answer-output.schema.json",
    additionalProperties: false
  }
);

export type ScreeningAnswerOutput = Static<typeof screeningAnswerOutputSchema>;
