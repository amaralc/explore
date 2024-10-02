import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import { RestExpressSharedResponseHandler } from '@peerlab/kernel/taxonomic-units/base/domains/_shared/adapters/rest-express-error-handler';
import { RestExpressTaxonomicUnitInstanceV1ResponseHandler } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-instance-v1/adapters/rest-express-error-handler';
import { RestExpressTaxonomicUnitV1ResponseHandler } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/adapters/rest-express-error-handler';
import express from 'express';

export class V1TaxonomicUnitInstancesController {
  configurationManager: ConfigurationManager;

  constructor(configurationManager: ConfigurationManager) {
    this.configurationManager = configurationManager;

    // Make sure to bind the methods to the class to have access to the configuration manager
    this.create = this.create.bind(this);
  }

  public async create(req: express.Request, res: express.Response): Promise<void> {
    const log: ILogMetadata = {
      message: '',
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

      log.message = `Success creating entity of schema name ${entityDto.schema.name}`;
      await RestExpressTaxonomicUnitInstanceV1ResponseHandler.handleCreateSuccess(entityDto, res, log);
    } catch (error) {
      await RestExpressTaxonomicUnitV1ResponseHandler.handleErrors(error, res, log);
      await RestExpressSharedResponseHandler.handleClientValidationError(error, res, log);
      await RestExpressSharedResponseHandler.handleServerError(error, res, log);
    }
  }
}
