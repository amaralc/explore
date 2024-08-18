import cors from 'cors';
import express from 'express';
import * as path from 'path';

import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import V1OrganizationsController from './routes/api/v1/organizations';
import V1OrganizationsIdController from './routes/api/v1/organizations/[id]';
import V1OrganizationsSeedController from './routes/api/v1/organizations[:]seed';
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

    const v1OrganizationsController = new V1OrganizationsController(configurationManager);
    router.post('/api/v1/organizations', v1OrganizationsController.createOrganization);
    router.get('/api/v1/organizations', v1OrganizationsController.filterOrganizationsV1);

    const v1OrganizationsSeedController = new V1OrganizationsSeedController(configurationManager);
    router.post('/api/v1/organizations[:]seed', v1OrganizationsSeedController.seedOrganizationsFromExternalSource);

    const v1OrganizationsIdController = new V1OrganizationsIdController(configurationManager);
    router.get('/api/v1/organizations/:id', v1OrganizationsIdController.getOrganizationById);

    // Initialize routes
    app.use(router);
    return { app, configurationManager };
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to bootstrap application: ${error.message}`);
  }
};
