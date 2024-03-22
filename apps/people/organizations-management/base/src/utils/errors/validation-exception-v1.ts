import { ErrorObject } from 'ajv';

export class ValidationExceptionV1 extends Error {
  causes: Array<ErrorObject>;

  constructor(errors: Array<ErrorObject>, message?: string) {
    const exceptionMessage = message || 'Validation exception.';
    super(exceptionMessage);
    this.causes = [...errors];
  }
}
