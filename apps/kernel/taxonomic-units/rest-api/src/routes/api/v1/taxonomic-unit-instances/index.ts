import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import { TaxonomicUnitV1NotFoundError } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/errors';
import express from 'express';

export class V1TaxonomicUnitInstancesController {
  configurationManager: ConfigurationManager;
  private entityName = 'TaxonomicUnitInstanceV1';

  constructor(configurationManager: ConfigurationManager) {
    this.configurationManager = configurationManager;

    // Make sure to bind the methods to the class to have access to the configuration manager
    this.create = this.create.bind(this);
  }

  public async create(req: express.Request, res: express.Response): Promise<void> {
    const log: ILogMetadata = {
      scope: {
        moduleName: V1TaxonomicUnitInstancesController.name,
        methodName: 'create',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Initialize use case' });
      const { createTaxonomicUnitV1Instance } = await this.configurationManager.getUseCases();

      log.steps.push({ message: 'Execute use case', metadata: { name: req.body.name } });
      const entityDto = await createTaxonomicUnitV1Instance.execute({
        schema: req.body.schema,
        data: req.body.data,
      });

      winstonLogger.info(`Success creating entity with name ${this.entityName}`, log);
      res.status(201).json(entityDto);
    } catch (error) {
      this.handleError(error, res, log);
    }
  }

  private handleError(error: unknown, res: express.Response, log: ILogMetadata) {
    if (error instanceof TaxonomicUnitV1NotFoundError) {
      winstonLogger.warn(error.message, log);
      return res.status(404).json({ message: error.message });
    }

    if (error instanceof ValidationExceptionV2Error) {
      winstonLogger.warn(error.message, log);
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof Error) {
      log.steps.push({ message: 'Error', metadata: { errorStack: error.stack } });
    } else {
      log.steps.push({ message: 'Error', metadata: { error } });
    }

    winstonLogger.error(`Error getting ${this.entityName} by its name`, log);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}
