export const dbScaffold = {
  packageName: "@job-hunt/db",
  purpose: "SQLite client, Drizzle schema, migrations, repositories, and seed data",
  migrationPolicy: "Additive migrations first; preserve prior run history for auditability"
} as const;
