import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import express from 'express';
import { ITaxonomicUnitInstanceV1 } from '../core/entity.schema.types';

export class RestExpressTaxonomicUnitInstanceV1ResponseHandler {
  static async handleCreateSuccess(entityDto: ITaxonomicUnitInstanceV1, res: express.Response, log: ILogMetadata) {
    winstonLogger.info(log.message, log);
    return res.status(201).json(entityDto);
  }
}
