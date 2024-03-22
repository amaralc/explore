import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { GetOrganizationV1ByIdUseCase } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/use-cases/get-organization-by-id';
import express from 'express';

export default class V1OrganizationsIdController {
  configurationManager: ConfigurationManager;

  constructor(configurationManager: ConfigurationManager) {
    this.configurationManager = configurationManager;

    // Make sure to bind the methods to the class to have access to the configuration manager
    this.getOrganizationById = this.getOrganizationById.bind(this);
  }

  public async getOrganizationById(req: express.Request, res: express.Response) {
    try {
      const repositories = await this.configurationManager.getRepositories();
      const getOrganizationV1ByIdUseCase = new GetOrganizationV1ByIdUseCase(repositories.organizationsV1);
      const organization = await getOrganizationV1ByIdUseCase.execute(req.params.id);

      if (!organization) {
        res.status(404).json({ message: 'Organization not found' });
      }

      res.json(organization);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}
