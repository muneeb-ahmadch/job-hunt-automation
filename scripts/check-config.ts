import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parse, printParseErrorCode, type ParseError } from "jsonc-parser";

const configFiles = [
  "config/default.jsonc",
  "config/host-capabilities.jsonc",
  "config/execution-policies.jsonc",
  "config/approval-policies.jsonc"
] as const;

function readJsonc(path: string): unknown {
  const errors: ParseError[] = [];
  const text = readFileSync(join(process.cwd(), path), "utf8");
  const parsed = parse(text, errors, {
    allowTrailingComma: true,
    disallowComments: false
  });

  if (errors.length > 0) {
    const rendered = errors
      .map((error) => `${printParseErrorCode(error.error)} at offset ${error.offset}`)
      .join(", ");
    throw new Error(`${path} contains JSONC parse errors: ${rendered}`);
  }

  return parsed;
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must parse to an object`);
  }
}

function assertArrayProperty(value: Record<string, unknown>, property: string, label: string): void {
  if (!Array.isArray(value[property])) {
    throw new Error(`${label} must include an array property named ${property}`);
  }
}

function assertObjectProperty(value: Record<string, unknown>, property: string, label: string): void {
  const child = value[property];
  if (!child || typeof child !== "object" || Array.isArray(child)) {
    throw new Error(`${label} must include an object property named ${property}`);
  }
}

for (const file of configFiles) {
  const parsed = readJsonc(file);
  assertRecord(parsed, file);

  if (file === "config/default.jsonc") {
    for (const property of ["runtime", "storage", "openai", "costControls", "routing", "security"]) {
      assertObjectProperty(parsed, property, file);
    }
  } else if (file === "config/host-capabilities.jsonc") {
    assertArrayProperty(parsed, "profiles", file);
  } else {
    assertArrayProperty(parsed, "policies", file);
  }
}

console.log(`Validated ${configFiles.length} JSONC config files.`);
