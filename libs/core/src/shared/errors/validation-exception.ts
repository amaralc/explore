import { Logger } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationException extends Error {
  causes: Array<Pick<ValidationError, 'property' | 'value' | 'constraints'>>;

  constructor(errors: Array<ValidationError> | ValidationError, message?: string) {
    const exceptionMessage = message || 'Validation exception.';
    super(exceptionMessage);

    if (errors instanceof ValidationError) {
      this.causes = [
        {
          property: errors.property,
          value: errors.value,
          constraints: errors.constraints,
        },
      ];
      return;
    }

    if (Array.isArray(errors)) {
      this.causes = errors.map((error) => {
        return {
          property: error.property,
          value: error.value,
          constraints: error.constraints,
        };
      });
      return;
    }

    this.causes = [];
    Logger.warn('Invalid errors array', 'ValidationException');
    Logger.warn(errors, 'ValidationException');
  }
}
