import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config as dotenvConfig } from "dotenv";

export interface LoadedEnv {
  path: string;
  loaded: boolean;
}

export function loadLocalEnv(rootDir = process.cwd()): LoadedEnv {
  const envPath = resolve(rootDir, ".env");
  if (!existsSync(envPath)) {
    return {
      path: envPath,
      loaded: false
    };
  }

  dotenvConfig({
    path: envPath,
    override: false,
    quiet: true
  });

  return {
    path: envPath,
    loaded: true
  };
}

export function readBooleanEnv(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function readNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a finite number`);
  }

  return parsed;
}

export function readStringEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value === "" ? fallback : value;
}

export function secretPresence(name: string): boolean {
  const value = process.env[name];
  return value !== undefined && value.length > 0;
}
