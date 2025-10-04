import { ValidationException } from '../errors/validation-exception';

export function parseOrRejectMessage(message: object | Buffer | null) {
  let parsedMessage = null;
  if (Array.isArray(message) || message === null) {
    throw new ValidationException([], 'Invalid JSON object');
  }

  if (message instanceof Buffer) {
    parsedMessage = JSON.parse(message.toString());
    if (typeof parsedMessage !== 'object') {
      throw new ValidationException([], 'Invalid JSON object');
    }
    return parsedMessage;
  }

  if (typeof message === 'object') {
    parsedMessage = message;
    return parsedMessage;
  }

  return parsedMessage;
}
