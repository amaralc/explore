import { ValidationException } from '../errors/validation-exception';
import { ApplicationLogger } from './application-logger';

export class EventErrorLog {
  constructor(private readonly logger: ApplicationLogger, error: unknown, metadata: Record<string, any>) {
    if (error instanceof ValidationException) {
      this.logger.error(error.message, {
        ...metadata,
        error: { ...error },
      });
      return;
    }

    if (error instanceof Error) {
      this.logger.error(error.message, {
        ...metadata,
        error: { ...error },
      });
      return;
    }

    this.logger.error('Error while consuming message', metadata);
  }
}
