import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { ConfigurationManager } from '@peerlab/things/assets-catalog/base/config/configuration-manager';
import { CreateTaxonomicUnitV1UseCase } from '@peerlab/things/assets-catalog/base/domains/taxonomic-units-v1/core/use-cases/create-taxonomic-unit';
import { TaxonomicUnitAlreadyExistsError } from '@peerlab/things/assets-catalog/base/domains/taxonomic-units-v1/core/use-cases/create-taxonomic-unit.errors';
import express from 'express';

export class V1TaxonomicUnitsController {
  private createTaxonomicUnitV1UseCase: CreateTaxonomicUnitV1UseCase;

  constructor(private readonly configurationManager: ConfigurationManager) {
    const log: ILogMetadata = {
      scope: {
        moduleName: 'things-assets-catalog-rest-api',
        className: this.constructor.name,
        methodName: 'constructor',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Getting repositories' });
      const repositories = this.configurationManager.getRepositories();

      log.steps.push({ message: 'Instantiating use case' });
      this.createTaxonomicUnitV1UseCase = new CreateTaxonomicUnitV1UseCase(repositories.taxonomicUnitsV1Database);

      // Make sure to bind the methods to the class to have access to the configuration manager
      log.steps.push({ message: 'Binding context' });
      this.create = this.create.bind(this);

      winstonLogger.info('Success instantiating V1TaxonomicUnitsController', log);
    } catch (error) {
      log.steps.push({
        message: 'Error while instantiating V1TaxonomicUnitsController',
        metadata: {
          errorStack: error.stack,
        },
      });

      winstonLogger.error('Error while instantiating V1TaxonomicUnitsController', log);
      throw error;
    }
  }

  public async create(req: express.Request, res: express.Response) {
    const log: ILogMetadata = {
      scope: {
        moduleName: 'things-assets-catalog-rest-api',
        className: this.constructor.name,
        methodName: 'constructor',
      },
      steps: [],
    };

    try {
      log.steps.push({ message: 'Executing createTaxonomicUnitV1UseCase' });
      const taxonomicUnit = await this.createTaxonomicUnitV1UseCase.execute(req.body);

      winstonLogger.info(`Successfully created taxonomic unit ${taxonomicUnit.slug} with id ${taxonomicUnit.id}`);
      res.status(201).json(taxonomicUnit);
    } catch (error) {
      log.steps.push({
        message: 'Error while creating TaxonomicUnitV1',
        metadata: {
          errorStack: error.stack,
        },
      });

      if (error instanceof ValidationExceptionV2Error) {
        res.status(400).json({ message: error.message, causes: error.causes });
        return;
      }

      if (error instanceof TaxonomicUnitAlreadyExistsError) {
        res.status(409).json({ message: error.message });
        return;
      }

      winstonLogger.error('Failed to create taxonomic unit', log);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
