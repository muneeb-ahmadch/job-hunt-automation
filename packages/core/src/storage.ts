import { existsSync, mkdirSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

import type { AppConfig } from "@job-hunt/schemas";

import { readStringEnv } from "./env";

export interface RuntimeStoragePaths {
  databaseUrl: string;
  databasePath: string;
  artifactRoot: string;
  rawImportRoot: string;
  screenshotRoot: string;
  domSnapshotRoot: string;
  traceRoot: string;
  logRoot: string;
  browserProfileDir: string;
}

export const defaultRuntimeDirectoryNames = [
  "data/local",
  "data/profiles",
  "data/exports",
  "data/raw",
  "data/screenshots",
  "data/dom-snapshots",
  "data/traces",
  "data/logs",
  "data/host-health",
  "data/browser-profile"
] as const;

export function findProjectRoot(startDir = process.cwd()): string {
  let current = resolve(startDir);

  for (;;) {
    if (existsSync(join(current, "plan.md")) && existsSync(join(current, "pnpm-workspace.yaml"))) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) {
      return resolve(startDir);
    }
    current = parent;
  }
}

export function resolveProjectPath(path: string, rootDir = process.cwd()): string {
  return isAbsolute(path) ? path : resolve(rootDir, path);
}

export function sqlitePathFromDatabaseUrl(databaseUrl: string, rootDir = process.cwd()): string {
  if (databaseUrl === ":memory:" || databaseUrl === "file::memory:") {
    return ":memory:";
  }

  const rawPath = databaseUrl.startsWith("file:") ? databaseUrl.slice("file:".length) : databaseUrl;
  return resolveProjectPath(rawPath, rootDir);
}

export function resolveRuntimeStorage(config: AppConfig, rootDir = process.cwd()): RuntimeStoragePaths {
  const databaseUrl = readStringEnv(config.storage.databaseUrlEnv, "file:./data/local/app.sqlite");
  const databasePath = sqlitePathFromDatabaseUrl(databaseUrl, rootDir);

  return {
    databaseUrl,
    databasePath,
    artifactRoot: resolveProjectPath(readStringEnv(config.storage.artifactRootEnv, "./data/exports"), rootDir),
    rawImportRoot: resolveProjectPath(readStringEnv(config.storage.rawImportRootEnv, "./data/raw"), rootDir),
    screenshotRoot: resolveProjectPath(readStringEnv(config.storage.screenshotRootEnv, "./data/screenshots"), rootDir),
    domSnapshotRoot: resolveProjectPath(
      readStringEnv(config.storage.domSnapshotRootEnv ?? "DOM_SNAPSHOT_ROOT", "./data/dom-snapshots"),
      rootDir
    ),
    traceRoot: resolveProjectPath(readStringEnv(config.storage.traceRootEnv, "./data/traces"), rootDir),
    logRoot: resolveProjectPath(readStringEnv(config.storage.logRootEnv, "./data/logs"), rootDir),
    browserProfileDir: resolveProjectPath(
      readStringEnv(config.storage.browserProfileDirEnv, "./data/browser-profile"),
      rootDir
    )
  };
}

export function ensureRuntimeDirectories(paths: RuntimeStoragePaths): void {
  for (const directory of [
    paths.artifactRoot,
    paths.rawImportRoot,
    paths.screenshotRoot,
    paths.domSnapshotRoot,
    paths.traceRoot,
    paths.logRoot,
    paths.browserProfileDir
  ]) {
    mkdirSync(directory, { recursive: true });
  }

  if (paths.databasePath !== ":memory:") {
    mkdirSync(dirname(paths.databasePath), { recursive: true });
  }
}

export function ensureDefaultRuntimeDirectories(rootDir = process.cwd()): string[] {
  const directories = defaultRuntimeDirectoryNames.map((directory) => join(rootDir, directory));
  for (const directory of directories) {
    mkdirSync(directory, { recursive: true });
  }

  return directories;
}

export function artifactBundleDirectory(input: {
  artifactRoot: string;
  batchId: string;
  jobSlug: string;
  artifactBundleId: string;
}): string {
  return join(input.artifactRoot, "batches", input.batchId, input.jobSlug, input.artifactBundleId);
}
