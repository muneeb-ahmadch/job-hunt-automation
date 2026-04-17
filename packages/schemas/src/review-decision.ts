import { Type, type Static } from "@sinclair/typebox";

import { reviewDecisionValueSchema, reviewEntityTypeSchema, reviewScopeTypeSchema } from "./common";

export const reviewDecisionOutputSchema = Type.Object(
  {
    scope_type: reviewScopeTypeSchema,
    entity_type: reviewEntityTypeSchema,
    entity_id: Type.String({ minLength: 1 }),
    decision: reviewDecisionValueSchema,
    review_notes: Type.String(),
    edited_payload: Type.Optional(Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()]))
  },
  {
    $id: "review-decision-output.schema.json",
    additionalProperties: false
  }
);

export type ReviewDecisionOutput = Static<typeof reviewDecisionOutputSchema>;
