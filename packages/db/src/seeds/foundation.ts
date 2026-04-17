import { schema, type InsertBatchRun, type InsertJobPosting, type InsertQueueJob } from "../schema";
import { createFoundationRepositories, type FoundationDatabase } from "../repos/foundation";

const seedTimestamp = "2026-01-01T00:00:00.000Z";

export interface SeedFoundationResult {
  batchId: string;
  jobPostingId: string;
  queueJobId: string;
}

export function seedFoundation(db: FoundationDatabase): SeedFoundationResult {
  const repos = createFoundationRepositories(db);
  const batchId = "batch_seed_foundation";
  const jobPostingId = "job_seed_greenhouse_frontend";
  const queueJobId = "queue_seed_score_greenhouse_frontend";

  db.insert(schema.masterProfiles)
    .values({
      id: "profile_seed_single_user",
      profileVersion: 1,
      fullName: "Local Operator",
      email: "operator@example.local",
      headline: "Seed profile for local dry-run testing",
      targetRolesJson: JSON.stringify(["Frontend Engineer", "Full Stack Engineer"]),
      remotePreferencesJson: JSON.stringify({ preferred: ["remote", "hybrid"] }),
      workAuthorizationJson: JSON.stringify({ requires_sponsorship: false }),
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp
    })
    .onConflictDoNothing()
    .run();

  const batch: InsertBatchRun = {
    id: batchId,
    batchType: "intake",
    status: "created",
    sourceLabel: "foundation seed",
    inputCount: 1,
    dedupedCount: 1,
    scoredCount: 0,
    skippedCount: 0,
    artifactsQueuedCount: 0,
    executionReadyCount: 0,
    submittedCount: 0,
    failedCount: 0,
    deadLetterCount: 0,
    createdAt: seedTimestamp
  };
  repos.upsertBatchRun(batch);

  const job: InsertJobPosting = {
    id: jobPostingId,
    batchId,
    sourceType: "ats_url",
    sourceUrl: "https://boards.greenhouse.io/example/jobs/123",
    sourceHost: "boards.greenhouse.io",
    externalJobId: "123",
    canonicalUrlHash: "seed-greenhouse-123",
    companyName: "Example Systems",
    jobTitle: "Frontend Engineer",
    locationText: "Remote",
    rawText: "Frontend Engineer role using TypeScript and React.",
    normalizedText: "frontend engineer role using typescript and react",
    contentHash: "seed-content-greenhouse-123",
    importStatus: "imported",
    laneType: "ats_lane",
    executionMode: "ats_adapter_execution",
    hostRiskTier: "low",
    queuePriority: 500,
    schedulerStatus: "queued",
    duplicateStatus: "unique",
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp
  };
  repos.upsertJobPosting(job);

  db.insert(schema.hostCapabilityProfiles)
    .values({
      id: "host_seed_greenhouse",
      host: "boards.greenhouse.io",
      siteType: "greenhouse",
      supportsPublicJobFetch: true,
      supportsApiApply: false,
      supportsAdapterApply: true,
      requiresBrowser: true,
      fragilityScore: 0.2,
      approvalStrictness: "low",
      authenticationBurden: "none",
      batchSafe: true,
      defaultMaxConcurrency: 2,
      defaultRateLimitPerMinute: 12,
      coolOffSeconds: 30,
      captchaLikelihood: 0.05,
      uploadStrategy: "auto_if_approved",
      notes: "Seeded from foundation config shape.",
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp
    })
    .onConflictDoUpdate({
      target: schema.hostCapabilityProfiles.host,
      set: {
        supportsAdapterApply: true,
        updatedAt: seedTimestamp
      }
    })
    .run();

  db.insert(schema.laneRouteDecisions)
    .values({
      id: "route_seed_greenhouse_frontend",
      jobPostingId,
      laneType: "ats_lane",
      executionMode: "ats_adapter_execution",
      routeReasonJson: JSON.stringify(["Known low-risk Greenhouse host", "Adapter execution preferred before browser fallback"]),
      hostType: "greenhouse",
      hostRiskTier: "low",
      approvalScope: "per_batch",
      submitGateRequired: true,
      batchSafe: true,
      fragilityScore: 0.2,
      requiresLogin: false,
      createdAt: seedTimestamp
    })
    .onConflictDoNothing()
    .run();

  const queueJob: InsertQueueJob = {
    id: queueJobId,
    batchId,
    jobPostingId,
    queueName: "score",
    laneType: "ats_lane",
    executionMode: "ats_adapter_execution",
    queuePriority: 500,
    schedulerStatus: "queued",
    hostBucket: "greenhouse:boards.greenhouse.io",
    retryCount: 0,
    artifactBundleId: null,
    submitGateRequired: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp
  };
  repos.enqueueQueueJob(queueJob);

  repos.recordAuditEvent({
    id: "audit_seed_foundation",
    entityType: "batch_run",
    entityId: batchId,
    eventType: "foundation.seeded",
    eventPayloadJson: JSON.stringify({ jobPostingId, queueJobId }),
    createdAt: seedTimestamp
  });

  return {
    batchId,
    jobPostingId,
    queueJobId
  };
}
