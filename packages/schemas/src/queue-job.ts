import { Type, type Static } from "@sinclair/typebox";

import {
  executionModeSchema,
  laneTypeSchema,
  nonNegativeIntegerSchema,
  queueNameSchema,
  schedulerStateSchema
} from "./common";

export const queueJobSchema = Type.Object(
  {
    batch_id: Type.String({ minLength: 1 }),
    job_posting_id: Type.String({ minLength: 1 }),
    queue_name: queueNameSchema,
    lane_type: laneTypeSchema,
    execution_mode: executionModeSchema,
    queue_priority: Type.Integer({ minimum: 0, maximum: 1000 }),
    scheduler_status: schedulerStateSchema,
    host_bucket: Type.String({ minLength: 1 }),
    retry_count: nonNegativeIntegerSchema,
    next_retry_at: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    artifact_bundle_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    submit_gate_required: Type.Optional(Type.Boolean())
  },
  {
    $id: "queue-job.schema.json",
    additionalProperties: false
  }
);

export type QueueJobContract = Static<typeof queueJobSchema>;
