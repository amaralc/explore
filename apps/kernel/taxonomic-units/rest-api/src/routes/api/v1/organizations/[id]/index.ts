import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
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
      const { getOrganizationV1ById } = await this.configurationManager.getUseCases();
      const organization = await getOrganizationV1ById.execute(req.params.id);

      if (!organization) {
        res.status(404).json({ message: 'Organization not found' });
      }

      res.json(organization);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}
