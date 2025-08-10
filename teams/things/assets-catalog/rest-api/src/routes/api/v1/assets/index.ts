import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { ConfigurationManager } from '@peerlab/things/assets-catalog/base/config/configuration-manager';
import { CreateAssetV1UseCase } from '@peerlab/things/assets-catalog/base/domains/assets-v1/core/use-cases/create-asset';
import { TaxonomicUnitV1NotFoundError } from '@peerlab/things/assets-catalog/base/domains/taxonomic-units-v1/core/errors';
import express from 'express';

export class V1AssetsController {
  private createAssetV1UseCase: CreateAssetV1UseCase;

  constructor(private readonly configurationManager: ConfigurationManager) {
    const log: ILogMetadata = {
      scope: {
        moduleName: 'api/v1/assets',
        className: this.constructor.name,
        methodName: 'constructor',
      },
      steps: [],
    };

    try {
      log.steps.push({ message: 'Getting repositories' });
      const repositories = this.configurationManager.getRepositories();

      log.steps.push({ message: 'Instantiating CreateAssetV1UseCase' });
      this.createAssetV1UseCase = new CreateAssetV1UseCase(
        repositories.assetsV1Database,
        repositories.taxonomicUnitsV1Database,
      );

      // Make sure to bind the methods to the class to have access to the configuration manager
      log.steps.push({ message: 'Binding methods to CreateAssetV1UseCase' });
      this.create = this.create.bind(this);

      winstonLogger.info('Success instantiating CreateAssetV1UseCase', log);
    } catch (error) {
      log.steps.push({
        message: 'Error instantiating CreateAssetV1UseCase',
        metadata: {
          errorStack: error.stack,
        },
      });
      winstonLogger.error('Error instantiating CreateAssetV1UseCase', log);
      throw error;
    }
  }

  public async create(req: express.Request, res: express.Response) {
    const log: ILogMetadata = {
      scope: {
        moduleName: 'api/v1/assets',
        className: this.constructor.name,
        methodName: 'create',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Executing createAssetV1UseCase' });
      const createdAssetV1 = await this.createAssetV1UseCase.execute(req.body);

      winstonLogger.info(`Successfully created asset '${createdAssetV1.name}' with id ${createdAssetV1.id}`);
      res.status(201).json(createdAssetV1);
    } catch (error) {
      if (error instanceof ValidationExceptionV2Error) {
        log.steps.push({
          message: 'Failed to create asset due to validation error',
          metadata: {
            causes: error.causes,
          },
        });
        winstonLogger.info('Failed to create asset due to validation error', log);
        res.status(400).json({ message: error.message, causes: error.causes });
        return;
      }

      if (error instanceof TaxonomicUnitV1NotFoundError) {
        log.steps.push({
          message: 'Failed to create asset. Taxonomic unit not found',
          metadata: {
            taxonomicUnitSlug: req.body.taxonomicUnitSlug,
          },
        });
        winstonLogger.info('Failed to create asset. Taxonomic unit not found', log);
        res.status(404).json({ message: error.message });
        return;
      }

      log.steps.push({
        message: 'Failed to create taxonomic unit due to unknown error',
        metadata: {
          taxonomicUnitSlug: req.body.taxonomicUnitSlug,
        },
      });
      winstonLogger.error('Failed to create taxonomic unit due to unknown error', log);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
