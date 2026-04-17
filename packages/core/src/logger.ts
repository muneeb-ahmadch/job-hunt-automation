import { mkdirSync } from "node:fs";
import { join } from "node:path";

import pino, { type Logger } from "pino";

import type { ResolvedRuntimeConfig } from "./config";

const redactPaths = [
  "OPENAI_API_KEY",
  "apiKey",
  "api_key",
  "password",
  "token",
  "cookie",
  "headers.authorization",
  "headers.cookie"
] as const;

export function createRuntimeLogger(config: ResolvedRuntimeConfig, component: string): Logger {
  const base = {
    component,
    dryRun: config.dryRun,
    localFirst: true
  };

  if (!config.app.logging.logToFile) {
    return pino({
      level: config.logLevel,
      base,
      redact: config.app.logging.redact ? { paths: [...redactPaths], censor: "[REDACTED]" } : undefined
    });
  }

  mkdirSync(config.storage.logRoot, { recursive: true });
  const destination = pino.destination({
    dest: join(config.storage.logRoot, `${component}.log`),
    sync: false,
    mkdir: true
  });

  return pino(
    {
      level: config.logLevel,
      base,
      redact: config.app.logging.redact ? { paths: [...redactPaths], censor: "[REDACTED]" } : undefined
    },
    destination
  );
}

export function redactForLogs<T extends Record<string, unknown>>(value: T): T {
  const clone: Record<string, unknown> = { ...value };
  for (const key of Object.keys(clone)) {
    if (/token|secret|password|cookie|api[_-]?key/i.test(key)) {
      clone[key] = "[REDACTED]";
    }
  }

  return clone as T;
}
