import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import { RestExpressSharedResponseHandler } from '@peerlab/kernel/taxonomic-units/base/domains/_shared/adapters/rest-express-error-handler';
import { RestExpressTaxonomicUnitV1ResponseHandler } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/adapters/rest-express-error-handler';
import express from 'express';

export class V1TaxonomicUnitByIdController {
  configurationManager: ConfigurationManager;

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

      log.message = `Success getting entity by id ${req.params.id}`;
      await RestExpressTaxonomicUnitV1ResponseHandler.handleGetByIdSuccess(entityDto, res, log);
    } catch (error) {
      await RestExpressTaxonomicUnitV1ResponseHandler.handleErrors(error, res, log);
      await RestExpressSharedResponseHandler.handleClientValidationError(error, res, log);
      await RestExpressSharedResponseHandler.handleServerError(error, res, log);
    }
  }
}
