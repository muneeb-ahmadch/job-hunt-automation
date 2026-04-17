import { randomUUID } from "node:crypto";

import type { createFoundationRepositories } from "@job-hunt/db";
import type { InsertQueueJob, QueueJobRow } from "@job-hunt/db";

export const queueManagerStatus = "sqlite-backed-foundation" as const;

export type FoundationRepositories = ReturnType<typeof createFoundationRepositories>;

export interface QueueManager {
  enqueue(input: InsertQueueJob): QueueJobRow | undefined;
  leaseNext(input: { queueName: string; hostBucket?: string; leaseSeconds?: number }): QueueJobRow | null | undefined;
  complete(id: string): QueueJobRow | undefined;
  countQueued(): number;
}

export function createQueueManager(repositories: FoundationRepositories): QueueManager {
  return {
    enqueue(input) {
      return repositories.enqueueQueueJob(input);
    },
    leaseNext(input) {
      const now = new Date();
      const leaseExpiresAt = new Date(now.getTime() + (input.leaseSeconds ?? 300) * 1000).toISOString();
      return repositories.leaseNextQueueJob({
        queueName: input.queueName,
        hostBucket: input.hostBucket,
        leaseToken: `lease_${randomUUID()}`,
        leaseExpiresAt,
        now: now.toISOString()
      });
    },
    complete(id) {
      return repositories.completeQueueJob(id);
    },
    countQueued() {
      return repositories.countQueueJobsByStatus("queued");
    }
  };
}
