import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type Database from "better-sqlite3";

const migrationDirectory = dirname(fileURLToPath(import.meta.url));
const defaultMigrationsPath = join(migrationDirectory, "migrations");

export interface MigrationResult {
  applied: string[];
  skipped: string[];
  migrationsPath: string;
}

export function runMigrations(sqlite: Database.Database, migrationsPath = defaultMigrationsPath): MigrationResult {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS migration_state (
      id TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const files = readdirSync(migrationsPath)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const applied = new Set(
    sqlite
      .prepare("SELECT id FROM migration_state")
      .all()
      .map((row) => (row as { id: string }).id)
  );
  const result: MigrationResult = {
    applied: [],
    skipped: [],
    migrationsPath
  };

  for (const file of files) {
    if (applied.has(file)) {
      result.skipped.push(file);
      continue;
    }

    const sql = readFileSync(join(migrationsPath, file), "utf8");
    const applyMigration = sqlite.transaction(() => {
      sqlite.exec(sql);
      sqlite.prepare("INSERT INTO migration_state (id) VALUES (?)").run(file);
    });
    applyMigration();
    result.applied.push(file);
  }

  return result;
}

export function listAppliedMigrations(sqlite: Database.Database): string[] {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS migration_state (
      id TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return sqlite
    .prepare("SELECT id FROM migration_state ORDER BY id")
    .all()
    .map((row) => (row as { id: string }).id);
}
