// This was not working as expected and the generated OpenAPI schema was not correct: https://github.com/sinclairzx81/typebox?tab=readme-ov-file#unsafe-types
// So we found this other approach and updated it to work with the latest version of typebox: https://github.com/sinclairzx81/typebox/issues/107#issuecomment-921959683

import { SchemaOptions, TLiteral, TUnion } from '@sinclair/typebox';

type IntoUnion<T> = { [K in keyof T]: T[K] extends string ? TLiteral<T[K]> : never };

export function CustomEnum<T extends string[]>(values: [...T], options?: SchemaOptions): TUnion<IntoUnion<T>> {
  return { type: 'string', enum: values, ...options } as any;
  // Note: it's possible to return OpenApi
  // compatible schemas and reinterpret
  // as TypeBox TSchema types. This type
  // is not strictly JSON schema, but so
  // long as it validates with the same
  // behavior (as per OpenAPI spec), we deem
  // this safe.
}
