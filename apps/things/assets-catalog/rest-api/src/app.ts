import cors from 'cors';
import express from 'express';
import * as path from 'path';

import { validateCors } from '@peerlab/kernel/shared-ts-utils/enable-cors';
import { ConfigurationManager } from '@peerlab/things/assets-catalog/base/config/configuration-manager';
import { V1AssetsController } from './routes/api/v1/assets';
import { V1TaxonomicUnitsController } from './routes/api/v1/taxonomic-units';
import OpenApiV3Controller from './routes/docs/v3/open-api-json';
import ApiReferenceController from './routes/docs/v3/reference';

export const bootstrapApplication = async (configurationManager: ConfigurationManager) => {
  try {
    // Initialize configuration manager (database connections, etc.)
    await import('dotenv').then((dotenv) => dotenv.config());

    await configurationManager.initialize();

    // Initialize Express application
    const app = express();
    app.use('/assets', express.static(path.join(__dirname, 'assets')));
    app.use(cors(validateCors));
    app.use(express.json());

    // Initialize Router
    const router = express.Router();

    const openApiV3Controller = new OpenApiV3Controller();
    router.get('/docs/v3/open-api-json', openApiV3Controller.getOpenApiV3JsonSpecification);

    const apiReferenceController = new ApiReferenceController();
    router.use('/docs/reference', apiReferenceController.getApiReference);

    const v1TaxonomicUnitsController = new V1TaxonomicUnitsController(configurationManager);
    router.post('/api/v1/taxonomic-units', v1TaxonomicUnitsController.create);

    const v1AssetsController = new V1AssetsController(configurationManager);
    router.post('/api/v1/assets', v1AssetsController.create);

    // Initialize routes
    app.use(router);
    return { app, configurationManager };
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to bootstrap application: ${error.message}`);
  }
};
