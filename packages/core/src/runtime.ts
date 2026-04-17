import { randomUUID } from "node:crypto";

import type { Logger } from "pino";

import { assertSafeModelBoundary, loadRuntimeConfig, type LoadRuntimeConfigOptions, type ResolvedRuntimeConfig } from "./config";
import { createRuntimeLogger } from "./logger";
import { ensureRuntimeDirectories } from "./storage";

export interface RuntimeContext {
  runId: string;
  component: string;
  startedAt: string;
  config: ResolvedRuntimeConfig;
  logger: Logger;
}

export interface InitializeRuntimeOptions extends LoadRuntimeConfigOptions {
  component: string;
  runId?: string;
}

export function initializeRuntime(options: InitializeRuntimeOptions): RuntimeContext {
  const config = loadRuntimeConfig(options);
  assertSafeModelBoundary(config);
  ensureRuntimeDirectories(config.storage);

  const context: RuntimeContext = {
    runId: options.runId ?? `run_${randomUUID()}`,
    component: options.component,
    startedAt: new Date().toISOString(),
    config,
    logger: createRuntimeLogger(config, options.component)
  };

  context.logger.info(
    {
      runId: context.runId,
      envLoaded: config.env.loaded,
      databasePath: config.storage.databasePath,
      openaiApiKeyPresent: config.openai.apiKeyPresent
    },
    "runtime.initialized"
  );

  return context;
}
