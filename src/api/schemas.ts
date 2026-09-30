/**
 * Lightweight contract (schema) validation - no extra dependency.
 * Checks: required fields, types, formats, and no unexpected fields.
 */
type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';
type Format = 'uuid' | 'email' | 'iso-date';

export interface Schema {
  required: Record<string, FieldType>;
  optional?: Record<string, FieldType>;
  formats?: Record<string, Format>;
  additionalProperties?: boolean; // false = extra fields are a failure (catches data leaks)
}

export const userResponseSchema: Schema = {
  required: { id: 'string', firstName: 'string', lastName: 'string', email: 'string', createdAt: 'string' },
  formats: { id: 'uuid', email: 'email', createdAt: 'iso-date' },
  additionalProperties: false,
};

export const errorResponseSchema: Schema = {
  required: { error: 'string' },
  optional: { message: 'string', details: 'array' },
  additionalProperties: false,
};

const FORMAT_CHECKS: Record<Format, (v: string) => boolean> = {
  'uuid': (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
  'email': (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  'iso-date': (v) => !Number.isNaN(Date.parse(v)) && /^\d{4}-\d{2}-\d{2}T/.test(v),
};

function typeOf(value: unknown): string {
  return Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
}

/** Returns a list of problems; empty list = body matches the schema. */
export function validateSchema(body: unknown, schema: Schema): string[] {
  if (typeOf(body) !== 'object') return [`Expected an object but got ${typeOf(body)}`];
  const obj = body as Record<string, unknown>;
  const problems: string[] = [];

  for (const [field, type] of Object.entries(schema.required)) {
    if (!(field in obj)) problems.push(`Missing required field "${field}"`);
    else if (typeOf(obj[field]) !== type) problems.push(`"${field}" should be ${type} but was ${typeOf(obj[field])}`);
  }
  for (const [field, type] of Object.entries(schema.optional ?? {})) {
    if (field in obj && typeOf(obj[field]) !== type) {
      problems.push(`"${field}" should be ${type} but was ${typeOf(obj[field])}`);
    }
  }
  for (const [field, format] of Object.entries(schema.formats ?? {})) {
    const value = obj[field];
    if (typeof value === 'string' && !FORMAT_CHECKS[format](value)) {
      problems.push(`"${field}" is not a valid ${format}: ${value}`);
    }
  }
  if (schema.additionalProperties === false) {
    const allowed = new Set([...Object.keys(schema.required), ...Object.keys(schema.optional ?? {})]);
    for (const field of Object.keys(obj)) {
      if (!allowed.has(field)) problems.push(`Unexpected field "${field}"`);
    }
  }
  return problems;
}

export const loginResponseSchema: Schema = {
  required: { token: 'string', user: 'object' },
  formats: { token: 'uuid' },
  additionalProperties: false,
};

export const authUserSchema: Schema = {
  required: { id: 'string', email: 'string', firstName: 'string', lastName: 'string', role: 'string' },
  formats: { id: 'uuid', email: 'email' },
  additionalProperties: false,
};
