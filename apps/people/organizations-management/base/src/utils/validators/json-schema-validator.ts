import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationExceptionV1 } from '../errors/validation-exception-v1';

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

  public validateOrReject<Schema>(schema: Schema, data: unknown): void {
    this.ajv.compile(schema);
    const isValid = this.ajv.validate(schema, data);
    if (!isValid) {
      throw new ValidationExceptionV1(this.ajv.errors, 'Invalid input used to create AgentV1Entity');
    }
  }
}

export const schemaValidator = new SchemaValidator();
