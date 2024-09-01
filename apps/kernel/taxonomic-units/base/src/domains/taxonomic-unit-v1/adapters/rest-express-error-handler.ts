import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import express from 'express';
import { ITaxonomicUnitV1 } from '../core/entity.schema.types';
import { TaxonomicUnitV1NotFoundError } from '../core/errors';

export class RestExpressTaxonomicUnitV1ResponseHandler {
  static async handleGetByIdSuccess(entityDto: ITaxonomicUnitV1, res: express.Response, log: ILogMetadata) {
    winstonLogger.info(log.message, log);
    return res.status(200).json(entityDto);
  }
  static async handleCreateSuccess(entityDto: ITaxonomicUnitV1, res: express.Response, log: ILogMetadata) {
    winstonLogger.info(log.message, log);
    return res.status(201).json(entityDto);
  }

  static async handleNotFoundError(error: unknown, res: express.Response, log: ILogMetadata) {
    if (res.writableEnded) {
      return;
    }
    if (error instanceof TaxonomicUnitV1NotFoundError) {
      winstonLogger.warn(error.message, log);
      return res.status(404).json({ message: error.message });
    }
  }
}
