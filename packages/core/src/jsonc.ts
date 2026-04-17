import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { parse, printParseErrorCode, type ParseError } from "jsonc-parser";

export function readJsoncFile(path: string, rootDir = process.cwd()): unknown {
  const absolutePath = resolve(rootDir, path);
  const text = readFileSync(absolutePath, "utf8");
  const errors: ParseError[] = [];
  const parsed = parse(text, errors, {
    allowTrailingComma: true,
    disallowComments: false
  });

  if (errors.length > 0) {
    const rendered = errors
      .map((error) => `${printParseErrorCode(error.error)} at offset ${error.offset}`)
      .join(", ");
    throw new Error(`${join(rootDir, path)} contains JSONC parse errors: ${rendered}`);
  }

  return parsed;
}
