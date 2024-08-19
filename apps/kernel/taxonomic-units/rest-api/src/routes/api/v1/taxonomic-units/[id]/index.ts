import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import { TaxonomicUnitV1NotFoundError } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/errors';
import express from 'express';

export class V1TaxonomicUnitByIdController {
  configurationManager: ConfigurationManager;
  private entityName = 'TaxonomicUnitV1';

  constructor(configurationManager: ConfigurationManager) {
    this.configurationManager = configurationManager;

    // Make sure to bind the methods to the class to have access to the configuration manager
    this.getById = this.getById.bind(this);
  }

  public async getById(req: express.Request<{ id: string }>, res: express.Response): Promise<void> {
    const log: ILogMetadata = {
      scope: {
        moduleName: V1TaxonomicUnitByIdController.name,
        methodName: 'getById',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Initialize use case' });
      const { getTaxonomicUnitV1ById } = await this.configurationManager.getUseCases();

      log.steps.push({ message: 'Execute use case', metadata: { id: req.params.id } });
      const entityDto = await getTaxonomicUnitV1ById.execute(req.params.id);

      winstonLogger.info(`Success getting ${this.entityName}`, log);
      res.json(entityDto);
    } catch (error) {
      this.handleError(error, res, log);
    }
  }

  private handleError(error: unknown, res: express.Response, log: ILogMetadata) {
    if (error instanceof TaxonomicUnitV1NotFoundError) {
      winstonLogger.warn(error.message, log);
      res.status(404).json({ message: error.message });
    }

    if (error instanceof ValidationExceptionV2Error) {
      winstonLogger.warn(error.message, log);
      res.status(400).json({ message: error.message });
    }

    if (error instanceof Error) {
      log.steps.push({ message: 'Error', metadata: { errorStack: error.stack } });
    } else {
      log.steps.push({ message: 'Error', metadata: { error } });
    }

    winstonLogger.error(`Error getting ${this.entityName} by its id`, log);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
