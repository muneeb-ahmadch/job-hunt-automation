import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { sqlitePathFromDatabaseUrl } from "@job-hunt/core";

import { schema } from "./schema";

export interface DatabaseClient {
  sqlite: Database.Database;
  db: BetterSQLite3Database<typeof schema>;
  databasePath: string;
  close(): void;
}

export interface CreateDatabaseClientOptions {
  databaseUrl?: string;
  databasePath?: string;
  rootDir?: string;
  readonly?: boolean;
}

export function createDatabaseClient(options: CreateDatabaseClientOptions = {}): DatabaseClient {
  const rootDir = options.rootDir ?? process.cwd();
  const databasePath =
    options.databasePath ?? sqlitePathFromDatabaseUrl(options.databaseUrl ?? "file:./data/local/app.sqlite", rootDir);

  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  const sqlite = new Database(databasePath, {
    readonly: options.readonly ?? false
  });
  sqlite.pragma("foreign_keys = ON");
  if (databasePath !== ":memory:" && !(options.readonly ?? false)) {
    sqlite.pragma("journal_mode = WAL");
  }

  const db = drizzle(sqlite, { schema });

  return {
    sqlite,
    db,
    databasePath,
    close() {
      sqlite.close();
    }
  };
}

export const databaseClientStatus = "foundation-implemented" as const;
