import { ErrorObject } from 'ajv';

export class ValidationExceptionV1Error extends Error {
  causes: Array<ErrorObject>;

  constructor(errors: Array<ErrorObject>, message?: string) {
    const exceptionMessage = message || 'Validation exception.';
    super(exceptionMessage);
    this.causes = [...errors];
  }
}

export class ValidationExceptionV2Error extends Error {
  causes: Array<string> = [];

  constructor(errors: Array<ErrorObject>) {
    const exceptionMessage = 'Validation exception';
    super(exceptionMessage);

    const causes = errors.map((error) => {
      return `Property ${error.instancePath} ${error.message}`;
    });

    this.causes = causes;
  }
}
