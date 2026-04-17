import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { ensureRuntimeDirectories, loadRuntimeConfig } from "../../packages/core/src/index";
import { createDatabaseClient, createFoundationRepositories, runMigrations, seedFoundation } from "../../packages/db/src/index";
import { createQueueManager } from "../../packages/scheduler/src/index";

const tempRoots: string[] = [];

function withTempRuntime() {
  const root = mkdtempSync(join(tmpdir(), "job-hunt-foundation-"));
  tempRoots.push(root);
  const previous = {
    DATABASE_URL: process.env.DATABASE_URL,
    ARTIFACT_ROOT: process.env.ARTIFACT_ROOT,
    RAW_IMPORT_ROOT: process.env.RAW_IMPORT_ROOT,
    SCREENSHOT_ROOT: process.env.SCREENSHOT_ROOT,
    DOM_SNAPSHOT_ROOT: process.env.DOM_SNAPSHOT_ROOT,
    TRACE_ROOT: process.env.TRACE_ROOT,
    LOG_ROOT: process.env.LOG_ROOT,
    BROWSER_PROFILE_DIR: process.env.BROWSER_PROFILE_DIR,
    LOG_LEVEL: process.env.LOG_LEVEL
  };

  process.env.DATABASE_URL = `file:${join(root, "app.sqlite")}`;
  process.env.ARTIFACT_ROOT = join(root, "exports");
  process.env.RAW_IMPORT_ROOT = join(root, "raw");
  process.env.SCREENSHOT_ROOT = join(root, "screenshots");
  process.env.DOM_SNAPSHOT_ROOT = join(root, "dom-snapshots");
  process.env.TRACE_ROOT = join(root, "traces");
  process.env.LOG_ROOT = join(root, "logs");
  process.env.BROWSER_PROFILE_DIR = join(root, "browser-profile");
  process.env.LOG_LEVEL = "silent";

  return {
    root,
    restore() {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  };
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("foundation smoke path", () => {
  it("validates config, creates runtime directories, migrates, seeds, and leases a queue job", () => {
    const temp = withTempRuntime();
    try {
      const runtime = loadRuntimeConfig({ loadEnvFile: false });
      ensureRuntimeDirectories(runtime.storage);
      const client = createDatabaseClient({ databaseUrl: runtime.storage.databaseUrl });

      try {
        const migrations = runMigrations(client.sqlite);
        const seed = seedFoundation(client.db);
        const repositories = createFoundationRepositories(client.db);
        const queue = createQueueManager(repositories);
        const leased = queue.leaseNext({
          queueName: "score",
          hostBucket: "greenhouse:boards.greenhouse.io",
          leaseSeconds: 60
        });

        expect(migrations.applied).toContain("0001_foundation.sql");
        expect(repositories.getBatchRun(seed.batchId)?.inputCount).toBe(1);
        expect(repositories.getJobPosting(seed.jobPostingId)?.sourceHost).toBe("boards.greenhouse.io");
        expect(leased?.id).toBe(seed.queueJobId);
        expect(leased?.schedulerStatus).toBe("leased");
      } finally {
        client.close();
      }
    } finally {
      temp.restore();
    }
  });
});
