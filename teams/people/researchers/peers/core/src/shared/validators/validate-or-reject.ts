import { validate } from 'class-validator';
import { ValidationException } from '../errors/validation-exception';

export const applicationValidateOrReject = async (object: object, message?: string) => {
  const errors = await validate(object);
  if (errors.length > 0) throw new ValidationException(errors, message);
};
