import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import express from 'express';

export class RestExpressSharedResponseHandler {
  static async handleClientValidationError(error: unknown, res: express.Response, log: ILogMetadata) {
    // Check if the response is already ended
    if (res.writableEnded) {
      return;
    }

    if (error instanceof ValidationExceptionV2Error) {
      winstonLogger.warn(error.message, log);
      return res.status(400).json({ message: error.message });
    }
  }

  static async handleServerError(error: unknown, res: express.Response, log: ILogMetadata) {
    if (res.writableEnded) {
      return;
    }

    if (error instanceof Error) {
      log.steps.push({ message: 'Error', metadata: { errorStack: error.stack } });
    } else {
      log.steps.push({ message: 'Error', metadata: { error } });
    }

    winstonLogger.error(log.message, log);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}
