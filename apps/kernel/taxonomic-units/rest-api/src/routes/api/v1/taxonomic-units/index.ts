import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { defaultPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import {
  DuplicatedTaxonomicUnitV1NameError,
  TaxonomicUnitV1NotFoundError,
} from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/errors';
import express from 'express';
import getOrganizationsV1UrlQueryParamsJsonSchema from './get-request.schema';

export class V1TaxonomicUnitsController {
  configurationManager: ConfigurationManager;
  private entityName = 'TaxonomicUnitV1';

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
      const organization = await createFirstVersionOfTaxonomicUnitV1UseCase.execute(req.body);
      winstonLogger.info(`Success creating ${this.entityName}`, log);
      return res.status(201).json(organization);
    } catch (error) {
      if (error instanceof ValidationExceptionV2Error) {
        winstonLogger.warn(error.message, log);
        return res.status(400).json({ message: error.message });
      }

      if (error instanceof DuplicatedTaxonomicUnitV1NameError) {
        winstonLogger.warn(error.message, log);
        return res.status(409).json({ message: error.message });
      }

      if (error instanceof TaxonomicUnitV1NotFoundError) {
        winstonLogger.warn(error.message, log);
        return res.status(404).json({ message: error.message });
      }

      winstonLogger.error(`Error creating ${this.entityName}`, log);
      // Information hiding for security reasons. Detailed message can be found in the logs
      return res.status(500).json({ message: 'Something went wrong' });
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
      const { filterOrganizationsV1 } = await this.configurationManager.getUseCases();

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

      const organizations = await filterOrganizationsV1.execute({ query, pagination });
      winstonLogger.info('Success filtering organizations', log);
      return res.status(200).json(organizations);
    } catch (error) {
      if (error instanceof ValidationExceptionV2Error) {
        winstonLogger.warn('Validation error filtering organizations', log);
        return res.status(400).json({ message: error.message });
      }

      if (error instanceof TaxonomicUnitV1NotFoundError) {
        winstonLogger.warn(error.message, log);
        return res.status(404).json({ message: error.message });
      }

      winstonLogger.error('Error filtering organizations', log);
      // Information hiding for security reasons. Detailed message can be found in the logs
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }
}
