export * from "./client";
export * from "./migrations";
export * from "./repos/foundation";
export * from "./schema";
export * from "./seeds/foundation";

export const dbScaffold = {
  packageName: "@job-hunt/db",
  purpose: "SQLite client, Drizzle schema, migrations, repositories, and seed data",
  migrationPolicy: "Additive migrations first; preserve prior run history for auditability",
  status: "foundation-implemented"
} as const;
