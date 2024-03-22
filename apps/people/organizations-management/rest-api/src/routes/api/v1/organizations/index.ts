import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { CreateOrganizationV1UseCase } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/use-cases/create-organization';
import express from 'express';

export default class V1OrganizationsController {
  configurationManager: ConfigurationManager;

  constructor(configurationManager: ConfigurationManager) {
    this.configurationManager = configurationManager;

    // Make sure to bind the methods to the class to have access to the configuration manager
    this.createOrganization = this.createOrganization.bind(this);
  }

  public async createOrganization(req: express.Request, res: express.Response) {
    try {
      const repositories = await this.configurationManager.getRepositories();

      const createOrganizationV1UseCase = new CreateOrganizationV1UseCase(
        repositories.organizationsV1,
        repositories.agentsV1,
      );

      const organization = await createOrganizationV1UseCase.execute(req.body);
      res.status(201).json(organization);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}
