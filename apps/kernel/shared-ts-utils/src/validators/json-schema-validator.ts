import Ajv, { AnySchemaObject, ErrorObject, Schema } from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationExceptionV2Error } from '../errors/validation-exception-v1';
import jsonSchemaMetaSchemaV4 from './json-schema-draft-04.schema';

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
    this.ajv.addMetaSchema(jsonSchemaMetaSchemaV4, 'http://json-schema.org/draft-04/schema#');
  }

  public validate(
    schema: Schema,
    data: unknown,
  ): { isValid: boolean; errors: ErrorObject<string, Record<string, any>, unknown>[] } {
    this.ajv.compile(schema);
    const isValid = this.ajv.validate(schema, data);

    const errors = [];
    if (this.ajv.errors) {
      errors.push(...this.ajv.errors);
    }

    return {
      isValid,
      errors,
    };
  }

  public validateOrReject(schema: Schema, data: unknown): void {
    this.ajv.compile(schema);
    const isValid = this.ajv.validate(schema, data);
    const errors = [];

    if (this.ajv.errors) {
      errors.push(...this.ajv.errors);
    }

    if (!isValid) {
      throw new ValidationExceptionV2Error(errors);
    }
  }

  public addMetaSchema(schema: AnySchemaObject, key: string) {
    this.ajv.addMetaSchema(schema, key);
  }
}

export const schemaValidator = new SchemaValidator();
