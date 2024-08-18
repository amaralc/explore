import cors from 'cors';
import express from 'express';
import * as path from 'path';

import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import { V1TaxonomicUnitsController } from './routes/api/v1/taxonomic-units';
import { V1TaxonomicUnitByIdController } from './routes/api/v1/taxonomic-units/[id]';
import OpenApiV3Controller from './routes/docs/v3/open-api-json';
import { validateCors } from './utils/enable-cors';

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

    const v1TaxonomicUnitsController = new V1TaxonomicUnitsController(configurationManager);
    router.post('/api/v1/taxonomic-units', v1TaxonomicUnitsController.createFirstVersion);
    router.get('/api/v1/taxonomic-units', v1TaxonomicUnitsController.filter);

    const v1TaxonomicUnitByIdController = new V1TaxonomicUnitByIdController(configurationManager);
    router.get('/api/v1/taxonomic-units/:id', v1TaxonomicUnitByIdController.getById);

    // Initialize routes
    app.use(router);
    return { app, configurationManager };
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to bootstrap application: ${error.message}`);
  }
};
