import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { defaultPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { OwnerAgentNotFoundError } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/errors';
import { FreeOrganizationLimitReachedError } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/use-cases/create-organization/errors';
import express from 'express';
import getOrganizationsV1UrlQueryParamsJsonSchema from './get-request.schema';

export default class V1OrganizationsController {
  configurationManager: ConfigurationManager;

  constructor(configurationManager: ConfigurationManager) {
    this.configurationManager = configurationManager;

    // Make sure to bind the methods to the class to have access to the configuration manager
    this.createOrganization = this.createOrganization.bind(this);
    this.filterOrganizationsV1 = this.filterOrganizationsV1.bind(this);
  }

  public async createOrganization(req: express.Request, res: express.Response) {
    const log: ILogMetadata = {
      scope: {
        moduleName: V1OrganizationsController.name,
        methodName: 'createOrganization',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Initialize and execute use case' });
      const { createOrganizationV1UseCase } = await this.configurationManager.getUseCases();
      const organization = await createOrganizationV1UseCase.execute(req.body);
      winstonLogger.info('Success creating organization', log);
      return res.status(201).json(organization);
    } catch (error) {
      if (error instanceof ValidationExceptionV2Error) {
        winstonLogger.warn('Validation error creating organization', log);
        return res.status(400).json({ message: error.message });
      }

      if (error instanceof FreeOrganizationLimitReachedError) {
        winstonLogger.warn('Free organization limit reached', log);
        return res.status(409).json({ message: error.message });
      }

      if (error instanceof OwnerAgentNotFoundError) {
        winstonLogger.warn(`Owner agent not found: ${req.body.ownerAgentId}`, log);
        return res.status(404).json({ message: error.message });
      }

      winstonLogger.error('Error creating organization', log);
      return res.status(500).json({ message: error.message });
    }
  }

  public async filterOrganizationsV1(req: express.Request, res: express.Response) {
    const log: ILogMetadata = {
      scope: {
        moduleName: V1OrganizationsController.name,
        methodName: 'filterOrganizationsV1',
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

      if (error instanceof OwnerAgentNotFoundError) {
        winstonLogger.warn(`Owner agent not found: ${req.query.ownerAgentId}`, log);
        return res.status(404).json({ message: error.message });
      }

      winstonLogger.error('Error filtering organizations', log);
      return res.status(500).json({ message: error.message });
    }
  }
}
