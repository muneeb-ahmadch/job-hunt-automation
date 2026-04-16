import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const runtimeDirectories = [
  "data/local",
  "data/profiles",
  "data/exports",
  "data/raw",
  "data/screenshots",
  "data/traces",
  "data/logs",
  "data/host-health",
  "data/browser-profile"
] as const;

for (const directory of runtimeDirectories) {
  mkdirSync(join(process.cwd(), directory), { recursive: true });
}

if (!existsSync(join(process.cwd(), ".env"))) {
  console.log("No .env file found. Create one from .env.example before running LLM-backed workflows.");
}

console.log(`Prepared ${runtimeDirectories.length} local runtime directories.`);
