import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { defaultPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema';
import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import { RestExpressTaxonomicUnitV1ResponseHandler } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/adapters/rest-express-error-handler';
import express from 'express';
import getOrganizationsV1UrlQueryParamsJsonSchema from './get-request.schema';

export class V1TaxonomicUnitsController {
  configurationManager: ConfigurationManager;
  private readonly entityName = 'TaxonomicUnitV1';

  constructor(configurationManager: ConfigurationManager) {
    this.configurationManager = configurationManager;

    // Make sure to bind the methods to the class to have access to the configuration manager
    this.createFirstVersion = this.createFirstVersion.bind(this);
    this.filter = this.filter.bind(this);
  }

  public async createFirstVersion(req: express.Request, res: express.Response) {
    const log: ILogMetadata = {
      scope: {
        moduleName: V1TaxonomicUnitsController.name,
        methodName: 'createFirstVersion',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Initialize and execute use case' });
      const { createFirstVersionOfTaxonomicUnitV1UseCase } = await this.configurationManager.getUseCases();
      const entityDto = await createFirstVersionOfTaxonomicUnitV1UseCase.execute(req.body);
      log.message = `Success creating ${this.entityName}`;
      RestExpressTaxonomicUnitV1ResponseHandler.handleCreateSuccess(entityDto, res, log);
    } catch (error) {
      RestExpressTaxonomicUnitV1ResponseHandler.handleErrors(error, res, log);
    }
  }

  public async filter(req: express.Request, res: express.Response) {
    const log: ILogMetadata = {
      scope: {
        moduleName: V1TaxonomicUnitsController.name,
        methodName: 'filter',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Validate query parameters' });
      schemaValidator.validateOrReject(getOrganizationsV1UrlQueryParamsJsonSchema, req.query);

      log.steps.push({ message: 'Initialize and execute use case' });
      const { filterTaxonomicUnitsV1UseCase } = await this.configurationManager.getUseCases();

      const query = {};
      if (req.query.ownerAgentId) {
        query['ownerAgentId'] = req.query.ownerAgentId as string;
      }

      const pagination = { ...defaultPaginationV1Dto };
      if (req.query.page) {
        pagination.page = Number(req.query.page);
      }
      if (req.query.limit) {
        pagination.limit = Number(req.query.limit);
      }

      const organizations = await filterTaxonomicUnitsV1UseCase.execute({ query, pagination });
      winstonLogger.info('Success filtering organizations', log);
      return res.status(200).json(organizations);
    } catch (error) {
      RestExpressTaxonomicUnitV1ResponseHandler.handleErrors(error, res, log);
    }
  }
}
