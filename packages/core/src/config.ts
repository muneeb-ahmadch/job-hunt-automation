import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import Ajv2020 from "ajv/dist/2020";
import type { AppConfig } from "@job-hunt/schemas";

import { loadLocalEnv, readBooleanEnv, readNumberEnv, readStringEnv, secretPresence, type LoadedEnv } from "./env";
import { readJsoncFile } from "./jsonc";
import { findProjectRoot, resolveRuntimeStorage, type RuntimeStoragePaths } from "./storage";

export interface ResolvedOpenAiConfig {
  apiKeyEnv: string;
  apiKeyPresent: boolean;
  defaultModel: string;
  smallModel: string;
  strongModel: string;
}

export interface ResolvedRuntimeConfig {
  rootDir: string;
  env: LoadedEnv;
  app: AppConfig;
  dryRun: boolean;
  defaultBrowserHeaded: boolean;
  storage: RuntimeStoragePaths;
  openai: ResolvedOpenAiConfig;
  monthlySoftUsdCap: number;
  logLevel: string;
}

export interface LoadRuntimeConfigOptions {
  rootDir?: string;
  configPath?: string;
  schemaPath?: string;
  loadEnvFile?: boolean;
}

function validateAgainstSchema(value: unknown, schemaPath: string, rootDir: string): AppConfig {
  const schema = JSON.parse(readFileSync(resolve(rootDir, schemaPath), "utf8")) as Record<string, unknown>;
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    validateFormats: false
  });
  const validate = ajv.compile(schema);
  const ok = validate(value);

  if (!ok) {
    const rendered = validate.errors
      ?.map((error) => `${error.instancePath || "/"} ${error.message ?? "failed validation"}`)
      .join("; ");
    throw new Error(`${schemaPath} validation failed: ${rendered}`);
  }

  return value as AppConfig;
}

export function loadRuntimeConfig(options: LoadRuntimeConfigOptions = {}): ResolvedRuntimeConfig {
  const rootDir = options.rootDir ?? findProjectRoot();
  const env = options.loadEnvFile === false ? { path: resolve(rootDir, ".env"), loaded: false } : loadLocalEnv(rootDir);
  const configPath = options.configPath ?? "config/default.jsonc";
  const schemaPath = options.schemaPath ?? "config/schemas/app-config.schema.json";
  const app = validateAgainstSchema(readJsoncFile(configPath, rootDir), schemaPath, rootDir);
  const storage = resolveRuntimeStorage(app, rootDir);
  const dryRun = readBooleanEnv("DRY_RUN", app.runtime.dryRun);

  return {
    rootDir,
    env,
    app,
    dryRun,
    defaultBrowserHeaded: readBooleanEnv("PLAYWRIGHT_HEADLESS", !app.runtime.defaultBrowserHeaded) ? false : app.runtime.defaultBrowserHeaded,
    storage,
    openai: {
      apiKeyEnv: app.openai.apiKeyEnv,
      apiKeyPresent: secretPresence(app.openai.apiKeyEnv),
      defaultModel: readStringEnv(app.openai.defaultModelEnv, ""),
      smallModel: readStringEnv(app.openai.smallModelEnv, ""),
      strongModel: readStringEnv(app.openai.strongModelEnv, "")
    },
    monthlySoftUsdCap: readNumberEnv(app.costControls.monthlySoftUsdCapEnv, 10),
    logLevel: readStringEnv(app.logging.levelEnv, "info")
  };
}

export function assertSafeModelBoundary(config: ResolvedRuntimeConfig): void {
  if (
    config.app.security.sendCookiesToModels ||
    config.app.security.sendPasswordsToModels ||
    config.app.security.sendTokensToModels
  ) {
    throw new Error("Config may not allow cookies, passwords, or tokens to be sent to model calls.");
  }
}
