import { Type, type Static } from "@sinclair/typebox";

import { approvalStatusSchema, artifactStatusSchema, outputModeSchema } from "./common";

export const artifactBundleSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    job_posting_id: Type.String({ minLength: 1 }),
    batch_id: Type.String({ minLength: 1 }),
    resume_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    cover_letter_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    answer_set_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    output_mode: outputModeSchema,
    is_submittable: Type.Boolean(),
    artifact_hash: Type.String({ minLength: 1 }),
    artifact_status: artifactStatusSchema,
    approval_status: approvalStatusSchema
  },
  {
    $id: "artifact-bundle.schema.json",
    additionalProperties: false
  }
);

export type ArtifactBundleContract = Static<typeof artifactBundleSchema>;
