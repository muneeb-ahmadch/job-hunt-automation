import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020";
import type { TSchema, Static } from "@sinclair/typebox";

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  errors: string[];
}

export interface CompiledSchema<T> {
  schemaId: string;
  validate(value: unknown): ValidationResult<T>;
  assert(value: unknown): T;
}

export function createAjv() {
  return new Ajv2020({
    allErrors: true,
    allowUnionTypes: true,
    strict: false,
    validateFormats: false
  });
}

const sharedAjv = createAjv();

export function formatValidationErrors(errors: ErrorObject[] | null | undefined): string[] {
  if (!errors?.length) {
    return [];
  }

  return errors.map((error) => {
    const path = error.instancePath || "/";
    return `${path} ${error.message ?? "failed validation"}`;
  });
}

export function compileSchema<TSchemaValue extends TSchema>(
  schema: TSchemaValue,
  ajv = sharedAjv
): CompiledSchema<Static<TSchemaValue>> {
  const validateFn = ajv.compile(schema) as ValidateFunction<Static<TSchemaValue>>;
  const schemaId = typeof schema.$id === "string" ? schema.$id : "anonymous-schema";

  return {
    schemaId,
    validate(value: unknown): ValidationResult<Static<TSchemaValue>> {
      const ok = validateFn(value);
      if (!ok) {
        return {
          ok: false,
          errors: formatValidationErrors(validateFn.errors)
        };
      }

      return {
        ok: true,
        value: value as Static<TSchemaValue>,
        errors: []
      };
    },
    assert(value: unknown): Static<TSchemaValue> {
      const result = this.validate(value);
      if (!result.ok) {
        throw new Error(`${schemaId} validation failed: ${result.errors.join("; ")}`);
      }

      return result.value as Static<TSchemaValue>;
    }
  };
}

export function assertValid<TSchemaValue extends TSchema>(schema: TSchemaValue, value: unknown): Static<TSchemaValue> {
  return compileSchema(schema).assert(value);
}
