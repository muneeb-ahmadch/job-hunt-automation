import { Type, type Static } from "@sinclair/typebox";

import { batchStatusSchema, batchTypeSchema, nonNegativeIntegerSchema } from "./common";

export const batchRunSchema = Type.Object(
  {
    batch_type: batchTypeSchema,
    status: batchStatusSchema,
    source_label: Type.Optional(Type.String()),
    input_count: nonNegativeIntegerSchema,
    deduped_count: nonNegativeIntegerSchema,
    scored_count: nonNegativeIntegerSchema,
    skipped_count: nonNegativeIntegerSchema,
    artifacts_queued_count: Type.Optional(nonNegativeIntegerSchema),
    execution_ready_count: nonNegativeIntegerSchema,
    submitted_count: Type.Optional(nonNegativeIntegerSchema),
    failed_count: Type.Optional(nonNegativeIntegerSchema),
    dead_letter_count: Type.Optional(nonNegativeIntegerSchema)
  },
  {
    $id: "batch-run.schema.json",
    additionalProperties: false
  }
);

export type BatchRunContract = Static<typeof batchRunSchema>;
