import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { ApplicationLogger } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { ConfigurationManager } from '@peerlab/things/assets-catalog/base/config/configuration-manager';
import { CreateTaxonomicUnitV1UseCase } from '@peerlab/things/assets-catalog/base/domains/taxonomic-units-v1/core/use-cases/create-taxonomic-unit';
import { TaxonomicUnitAlreadyExistsError } from '@peerlab/things/assets-catalog/base/domains/taxonomic-units-v1/core/use-cases/create-taxonomic-unit.errors';
import express from 'express';

export class V1TaxonomicUnitsController {
  private logger: ApplicationLogger;
  configurationManager: ConfigurationManager;

  constructor(configurationManager: ConfigurationManager) {
    this.configurationManager = configurationManager;
    this.logger = this.configurationManager.getLogger();

    // Make sure to bind the methods to the class to have access to the configuration manager
    this.create = this.create.bind(this);
  }

  public async create(req: express.Request, res: express.Response) {
    try {
      const repositories = await this.configurationManager.getRepositories();

      const createTaxonomicUnitV1UseCase = new CreateTaxonomicUnitV1UseCase(
        repositories.taxonomicUnitsV1Database,
        this.logger,
      );

      const taxonomicUnit = await createTaxonomicUnitV1UseCase.execute(req.body);

      res.status(201).json(taxonomicUnit);
    } catch (error) {
      if (error instanceof ValidationExceptionV2Error) {
        res.status(400).json({ message: error.message, causes: error.causes });
        return;
      }

      if (error instanceof TaxonomicUnitAlreadyExistsError) {
        res.status(409).json({ message: error.message });
        return;
      }

      res.status(500).json({ message: error.message });
    }
  }
}
