import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { TemporaryAccountHolderNotFoundError } from '@peerlab/people/organizations-management/base/domains/_shared/core/use-cases/extract-entities-from-external-source/errors';
import express from 'express';
import { seedOrganizationsFromExternalSourceInputDtoSchema } from './post.types';

export default class V1OrganizationsSeedController {
  configurationManager: ConfigurationManager;

  constructor(configurationManager: ConfigurationManager) {
    this.configurationManager = configurationManager;

    // Make sure to bind the methods to the class to have access to the configuration manager
    this.seedOrganizationsFromExternalSource = this.seedOrganizationsFromExternalSource.bind(this);
  }

  public async seedOrganizationsFromExternalSource(req: express.Request, res: express.Response) {
    const log: ILogMetadata = {
      scope: {
        moduleName: V1OrganizationsSeedController.name,
        methodName: 'seedOrganizationsFromExternalSource',
      },
      steps: [],
    };

    try {
      log.steps.push({ message: 'Validate request body' });
      schemaValidator.validateOrReject(seedOrganizationsFromExternalSourceInputDtoSchema, req.body);
      const accountHolderAgentId = req.body.agentAccountHolderId;

      log.steps.push({ message: 'Retrieve use case' });
      const useCases = await this.configurationManager.getUseCases();
      const seedOrganizationsFromExternalSourceUseCase = useCases.extractEntitiesFromExternalSource;

      log.steps.push({ message: 'Execute use case' });
      const extractionResult = await seedOrganizationsFromExternalSourceUseCase.execute(accountHolderAgentId);

      log.steps.push({ message: 'Extraction result', metadata: { extractionResult } });
      const successMessage = 'Success extracting and storing organizations from external source';
      winstonLogger.info(successMessage, log);
      return res.status(201).json(extractionResult);
    } catch (error) {
      if (error instanceof ValidationExceptionV2Error) {
        winstonLogger.warn('Error validating request body', log);
        return res.status(400).json({ message: error.message });
      }

      if (error instanceof TemporaryAccountHolderNotFoundError) {
        winstonLogger.warn('Account holder agent not found', log);
        return res.status(404).json({ message: error.message });
      }

      winstonLogger.error('Error extracting and storing organizations from external source', log);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
