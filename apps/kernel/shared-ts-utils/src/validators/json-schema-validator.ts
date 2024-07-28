import Ajv, { ErrorObject, Schema } from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationExceptionV2Error } from '../errors/validation-exception-v1';

export class SchemaValidator {
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      allowDate: true,
      formats: {
        date: true,
        time: true,
      },
    });

    this.ajv = addFormats(
      new Ajv({
        allErrors: true,
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
}

export const schemaValidator = new SchemaValidator();
