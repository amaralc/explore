import Ajv, { AnySchemaObject, ErrorObject, Schema } from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationExceptionV2Error } from '../../errors/validation-exception-v1';

export class InvalidJsonSchemaError extends Error { }

export class JsonSchemaCompatibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JsonSchemaCompatibilityError';
  }
}

export class SchemaValidator {
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = addFormats(
      new Ajv({
        /**
         * Prevent denial of service attacks by using allErrors equal to true only in debug mode
         * @see https://github.com/ajv-validator/ajv/blob/master/docs/security.md#untrusted-schemas
         * @see https://cwe.mitre.org/data/definitions/400.html
         */
        allErrors: process.env['APP_DEBUG'] === 'true',
        allowDate: true,
        formats: {
          date: true,
          time: true,
        },
      }),
      [
        'date-time',
        'time',
        'date',
        'email',
        'hostname',
        'ipv4',
        'ipv6',
        'uri',
        'uri-reference',
        'uuid',
        'uri-template',
        'json-pointer',
        'relative-json-pointer',
        'regex',
        'duration',
        'byte',
        'int32',
        'int64',
        'float',
        'double',
        'password',
        'binary',
      ],
    );

    // Add reference meta schema v4 to allow reference to other schemas
    // this.ajv.addMetaSchema(jsonSchemaMetaSchemaV4, 'http://json-schema.org/draft-04/schema#');
  }

  public validate(
    schema: Schema,
    data: unknown,
  ): { errorsText: string; errors: ErrorObject<string, Record<string, any>, unknown>[] } {
    // TODO: implement cache control
    this.ajv.compile(schema);
    this.ajv.validate(schema, data);

    const errors = [];
    if (this.ajv.errors) {
      errors.push(...this.ajv.errors);
    }

    return {
      errors,
      errorsText: this.ajv.errorsText(),
    };
  }

  public validateOrReject(schema: Schema, data: unknown): void {
    try {
      this.ajv.compile(schema);
      const isValid = this.ajv.validate(schema, data);
      const errors = [];

      if (this.ajv.errors) {
        errors.push(...this.ajv.errors);
      }

      if (!isValid) {
        throw new ValidationExceptionV2Error(errors);
      }
    } catch (error) {
      if (error instanceof ValidationExceptionV2Error) {
        throw error;
      }

      throw new InvalidJsonSchemaError(this.ajv.errorsText());
    }

  }

  public addMetaSchema(schema: AnySchemaObject, key: string) {
    this.ajv.addMetaSchema(schema, key);
  }

  public checkBackwardsCompatibility(
    readerSchema: Schema,
    writerSchema: Schema,
  ): { errors: string[]; errorsText: string } {
    const errors: string[] = [];

    function checkTypeCompatibility(reader: any, writer: any, path: string, errors: Array<string>): Array<string> {
      // Check unions (oneOf)
      if (writer.oneOf && reader.oneOf) {
        const writerSubSchemaIsSubset = writer.oneOf.every((writerSubSchema: Schema) => {
          const readerSubSchemaIsCompatible = reader.oneOf.some((readerSubSchema: Schema) => {
            return checkTypeCompatibility(readerSubSchema, writerSubSchema, path, []).length === 0;
          });
          if (!readerSubSchemaIsCompatible) {
            errors.push(`${path}: Writer union schema is not compatible with any reader union schema`);
          }
          return readerSubSchemaIsCompatible;
        });

        if (!writerSubSchemaIsSubset) {
          return errors;
        }
      } else if (reader.oneOf && !writer.oneOf) {
        const readerSubSchemaHasCompatibleWriterSchema = reader.oneOf.some((readerSubSchema: Schema) => {
          return checkTypeCompatibility(readerSubSchema, writer, path, []).length === 0;
        });

        if (!readerSubSchemaHasCompatibleWriterSchema) {
          errors.push(`${path}: Reader union schema does not contain a schema that is compatible with the writer schema`);
        }
      }

      // If writer doesn't specify type, it's compatible
      if (!writer.type) {
        return errors;
      };

      // If types don't match, check for integer -> number promotion
      if (writer.type !== reader.type) {
        if (writer.type === 'integer' && reader.type === 'number') {
          return errors; // This promotion is allowed
        }
        errors.push(`${path}: Type mismatch - writer type '${writer.type}' is not compatible with reader type '${reader.type}'`);
        return errors;
      }

      // Type-specific checks
      switch (writer.type) {
        case 'string':
          // Check string constraints
          if (writer.minLength !== undefined && reader.minLength !== undefined && writer.minLength < reader.minLength) {
            errors.push(`${path}: Writer's minLength (${writer.minLength}) is less restrictive than reader's (${reader.minLength})`);
          }
          if (writer.maxLength !== undefined && reader.maxLength !== undefined && writer.maxLength > reader.maxLength) {
            errors.push(`${path}: Writer's maxLength (${writer.maxLength}) is less restrictive than reader's (${reader.maxLength})`);
          }
          if (writer.enum && reader.enum) {
            // First check if writer's enum values are a subset of reader's enum values
            for (const value of writer.enum) {
              if (!reader.enum.includes(value)) {
                errors.push(`${path}: Writer enum value '${value}' is not present in reader enum`);
              }
            }
          }
          break;

        case 'number':
        case 'integer':
          // Check numeric constraints
          if (writer.minimum !== undefined && reader.minimum !== undefined && writer.minimum < reader.minimum) {
            errors.push(`${path}: Writer's minimum (${writer.minimum}) is less restrictive than reader's (${reader.minimum})`);
          }
          if (writer.maximum !== undefined && reader.maximum !== undefined && writer.maximum > reader.maximum) {
            errors.push(`${path}: Writer's maximum (${writer.maximum}) is less restrictive than reader's (${reader.maximum})`);
          }
          if (writer.type === 'integer' && writer.multipleOf !== undefined && reader.multipleOf !== undefined) {
            if (writer.multipleOf % reader.multipleOf !== 0) {
              errors.push(`${path}: Writer's multipleOf (${writer.multipleOf}) is not a multiple of reader's (${reader.multipleOf})`);
            }
          }
          break;

        case 'array':
          // Check array constraints
          if (writer.minItems !== undefined && reader.minItems !== undefined && writer.minItems < reader.minItems) {
            errors.push(`${path}: Writer's minItems (${writer.minItems}) is less restrictive than reader's (${reader.minItems})`);
          }
          if (writer.maxItems !== undefined && reader.maxItems !== undefined && writer.maxItems > reader.maxItems) {
            errors.push(`${path}: Writer's maxItems (${writer.maxItems}) is less restrictive than reader's (${reader.maxItems})`);
          }
          if (writer.uniqueItems === true && reader.uniqueItems !== true) {
            errors.push(`${path}: Writer requires unique items but reader does not`);
          }

          // Check array items compatibility
          if (writer.items && reader.items) {
            if (Array.isArray(writer.items)) {
              // Tuple validation
              if (!Array.isArray(reader.items)) {
                errors.push(`${path}: Writer uses tuple validation but reader does not`);
              } else {
                writer.items.forEach((item: any, index: number) => {
                  if (reader.items[index]) {
                    checkTypeCompatibility(reader.items[index], item, `${path}[${index}]`, errors);
                  } else {
                    errors.push(`${path}: Writer tuple has more items than reader`);
                  }
                });
              }
            } else {
              // List validation
              checkTypeCompatibility(reader.items, writer.items, `${path}.items`, errors);
            }
          }
          break;

        case 'object':
          // Check object constraints
          if (writer.minProperties !== undefined && reader.minProperties !== undefined && writer.minProperties < reader.minProperties) {
            errors.push(`${path}: Writer's minProperties (${writer.minProperties}) is less restrictive than reader's (${reader.minProperties})`);
          }
          if (writer.maxProperties !== undefined && reader.maxProperties !== undefined && writer.maxProperties > reader.maxProperties) {
            errors.push(`${path}: Writer's maxProperties (${writer.maxProperties}) is less restrictive than reader's (${reader.maxProperties})`);
          }

          // Check required properties
          if (writer.required && reader.required) {
            const missingRequired = reader.required.filter((prop: string) => !writer.required.includes(prop));
            if (missingRequired.length > 0) {
              errors.push(`${path}: Reader requires properties that writer does not: ${missingRequired.join(', ')}`);
            }
          }

          // Check property compatibility
          if (writer.properties) {
            Object.entries(writer.properties).forEach(([propName, propSchema]) => {
              const readerProp = reader.properties?.[propName];
              if (readerProp) {
                checkTypeCompatibility(readerProp, propSchema, `${path}.${propName}`, errors);
              } else if (reader.additionalProperties === false) {
                errors.push(`${path}: Writer has property '${propName}' not allowed by reader's closed content model`);
              }
            });
          }

          // Check additional properties
          if (writer.additionalProperties !== false && reader.additionalProperties === false) {
            errors.push(`${path}: Writer has open content model but reader requires closed content model`);
          }
          break;
      }

      return errors;
    }

    try {
      // Validate both schemas are valid JSON Schema
      this.ajv.compile(readerSchema);
      this.ajv.compile(writerSchema);

      // Check compatibility
      const errors = checkTypeCompatibility(readerSchema, writerSchema, 'root', []);

      return {
        errors,
        errorsText: errors.join('\n'),
      };
    } catch (error) {
      throw new InvalidJsonSchemaError(`Invalid JSON Schema: ${(error as Error).message}`);
    }
  }
}

export const schemaValidator = new SchemaValidator();
