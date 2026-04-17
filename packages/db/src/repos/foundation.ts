import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, isNull, lte, or, type SQL } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { schema, type InsertAuditEvent, type InsertBatchRun, type InsertJobPosting, type InsertQueueJob, type InsertRunMetadata } from "../schema";

export type FoundationDatabase = BetterSQLite3Database<typeof schema>;

function nowIso(): string {
  return new Date().toISOString();
}

export function createFoundationRepositories(db: FoundationDatabase) {
  return {
    upsertRunMetadata(input: InsertRunMetadata) {
      db.insert(schema.runMetadata)
        .values(input)
        .onConflictDoUpdate({
          target: schema.runMetadata.id,
          set: {
            status: input.status,
            completedAt: input.completedAt,
            metadataJson: input.metadataJson,
            updatedAt: nowIso()
          }
        })
        .run();

      return db.select().from(schema.runMetadata).where(eq(schema.runMetadata.id, input.id)).get();
    },

    recordAuditEvent(input: Omit<InsertAuditEvent, "id"> & { id?: string }) {
      const id = input.id ?? `audit_${randomUUID()}`;
      db.insert(schema.auditEvents)
        .values({
          ...input,
          id
        })
        .onConflictDoNothing()
        .run();

      return db.select().from(schema.auditEvents).where(eq(schema.auditEvents.id, id)).get();
    },

    upsertBatchRun(input: InsertBatchRun) {
      db.insert(schema.batchRuns)
        .values(input)
        .onConflictDoUpdate({
          target: schema.batchRuns.id,
          set: {
            status: input.status,
            inputCount: input.inputCount,
            dedupedCount: input.dedupedCount,
            scoredCount: input.scoredCount,
            skippedCount: input.skippedCount,
            artifactsQueuedCount: input.artifactsQueuedCount,
            executionReadyCount: input.executionReadyCount,
            submittedCount: input.submittedCount,
            failedCount: input.failedCount,
            deadLetterCount: input.deadLetterCount,
            completedAt: input.completedAt
          }
        })
        .run();

      return db.select().from(schema.batchRuns).where(eq(schema.batchRuns.id, input.id)).get();
    },

    getBatchRun(id: string) {
      return db.select().from(schema.batchRuns).where(eq(schema.batchRuns.id, id)).get();
    },

    upsertJobPosting(input: InsertJobPosting) {
      db.insert(schema.jobPostings)
        .values(input)
        .onConflictDoUpdate({
          target: schema.jobPostings.id,
          set: {
            sourceUrl: input.sourceUrl,
            sourceHost: input.sourceHost,
            companyName: input.companyName,
            jobTitle: input.jobTitle,
            rawText: input.rawText,
            normalizedText: input.normalizedText,
            contentHash: input.contentHash,
            importStatus: input.importStatus,
            laneType: input.laneType,
            executionMode: input.executionMode,
            hostRiskTier: input.hostRiskTier,
            queuePriority: input.queuePriority,
            schedulerStatus: input.schedulerStatus,
            duplicateStatus: input.duplicateStatus,
            updatedAt: nowIso()
          }
        })
        .run();

      return db.select().from(schema.jobPostings).where(eq(schema.jobPostings.id, input.id)).get();
    },

    getJobPosting(id: string) {
      return db.select().from(schema.jobPostings).where(eq(schema.jobPostings.id, id)).get();
    },

    enqueueQueueJob(input: InsertQueueJob) {
      db.insert(schema.queueJobs)
        .values(input)
        .onConflictDoUpdate({
          target: schema.queueJobs.id,
          set: {
            queuePriority: input.queuePriority,
            schedulerStatus: input.schedulerStatus,
            hostBucket: input.hostBucket,
            retryCount: input.retryCount,
            nextRetryAt: input.nextRetryAt,
            updatedAt: nowIso()
          }
        })
        .run();

      return db.select().from(schema.queueJobs).where(eq(schema.queueJobs.id, input.id)).get();
    },

    leaseNextQueueJob(input: {
      queueName: string;
      hostBucket?: string;
      leaseToken: string;
      leaseExpiresAt: string;
      now?: string;
    }) {
      const currentTime = input.now ?? nowIso();
      const filters: SQL[] = [
        eq(schema.queueJobs.queueName, input.queueName),
        eq(schema.queueJobs.schedulerStatus, "queued"),
        or(isNull(schema.queueJobs.nextRetryAt), lte(schema.queueJobs.nextRetryAt, currentTime)) as SQL
      ];
      if (input.hostBucket) {
        filters.push(eq(schema.queueJobs.hostBucket, input.hostBucket));
      }

      const candidate = db
        .select()
        .from(schema.queueJobs)
        .where(and(...filters))
        .orderBy(desc(schema.queueJobs.queuePriority), asc(schema.queueJobs.createdAt))
        .limit(1)
        .get();

      if (!candidate) {
        return null;
      }

      db.update(schema.queueJobs)
        .set({
          schedulerStatus: "leased",
          leaseToken: input.leaseToken,
          leaseExpiresAt: input.leaseExpiresAt,
          updatedAt: currentTime
        })
        .where(eq(schema.queueJobs.id, candidate.id))
        .run();

      return db.select().from(schema.queueJobs).where(eq(schema.queueJobs.id, candidate.id)).get();
    },

    completeQueueJob(id: string) {
      db.update(schema.queueJobs)
        .set({
          schedulerStatus: "completed",
          leaseToken: null,
          leaseExpiresAt: null,
          updatedAt: nowIso()
        })
        .where(eq(schema.queueJobs.id, id))
        .run();

      return db.select().from(schema.queueJobs).where(eq(schema.queueJobs.id, id)).get();
    },

    countQueueJobsByStatus(status: string): number {
      const rows = db.select().from(schema.queueJobs).where(eq(schema.queueJobs.schedulerStatus, status)).all();
      return rows.length;
    }
  };
}
