import { existsSync } from "node:fs";
import { join } from "node:path";

import { defaultRuntimeDirectoryNames, ensureDefaultRuntimeDirectories } from "@job-hunt/core";

ensureDefaultRuntimeDirectories(process.cwd());

if (!existsSync(join(process.cwd(), ".env"))) {
  console.log("No .env file found. Create one from .env.example before running LLM-backed workflows.");
}

console.log(`Prepared ${defaultRuntimeDirectoryNames.length} local runtime directories.`);
