import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import express from 'express';

export class RestExpressTaxonomicUnitInstanceV1ResponseHandler {
  static async handleCreateSuccess(entityDto: unknown, res: express.Response, log: ILogMetadata) {
    winstonLogger.info(log.message, log);
    return res.status(201).json(entityDto);
  }
}
