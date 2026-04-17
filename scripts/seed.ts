import { createDatabaseClient, runMigrations, seedFoundation } from "@job-hunt/db";
import { initializeRuntime } from "@job-hunt/core";

const runtime = initializeRuntime({ component: "seed" });
const client = createDatabaseClient({
  databaseUrl: runtime.config.storage.databaseUrl,
  rootDir: runtime.config.rootDir
});

try {
  runMigrations(client.sqlite);
  const result = seedFoundation(client.db);
  console.log(`Seeded foundation fixtures: batch=${result.batchId} job=${result.jobPostingId} queue=${result.queueJobId}.`);
} finally {
  client.close();
}
