import { createDatabaseClient, createFoundationRepositories, runMigrations } from "@job-hunt/db";
import { initializeRuntime } from "@job-hunt/core";

const runtime = initializeRuntime({ component: "migrate" });
const client = createDatabaseClient({
  databaseUrl: runtime.config.storage.databaseUrl,
  rootDir: runtime.config.rootDir
});

try {
  const result = runMigrations(client.sqlite);
  const repos = createFoundationRepositories(client.db);
  repos.upsertRunMetadata({
    id: runtime.runId,
    component: runtime.component,
    dryRun: runtime.config.dryRun,
    startedAt: runtime.startedAt,
    completedAt: new Date().toISOString(),
    status: "completed",
    metadataJson: JSON.stringify({
      applied: result.applied,
      skipped: result.skipped,
      databasePath: client.databasePath
    })
  });

  console.log(
    `Migrations complete for ${client.databasePath}. Applied=${result.applied.length} skipped=${result.skipped.length}.`
  );
} finally {
  client.close();
}
