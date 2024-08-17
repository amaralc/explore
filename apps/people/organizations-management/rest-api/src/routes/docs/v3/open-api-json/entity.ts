import agentV1DtoJsonSchema from '@peerlab/people/organizations-management/base/domains/agents-v1/core/entity.schema';
import organizationV1JsonSchema from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/entity.schema';
import userV1JsonSchema from '@peerlab/people/organizations-management/base/domains/users-v1/core/entity.schema';
import { OpenApiBuilder } from 'openapi3-ts/oas30';
import { AgentV1Entity } from '../../../../../../base/src/domains/agents-v1/core/entity';
import { OrganizationV1Entity } from '../../../../../../base/src/domains/organizations-v1/core/entity';
import { UserV1Entity } from '../../../../../../base/src/domains/users-v1/core/entity';
import { v1OrganizationsIdControllerSchema } from '../../../api/v1/organizations/[id]/index.docs';
import { organizationsV1ControllerSchema } from '../../../api/v1/organizations/index.docs';
import { organizationsV1SeedControllerSchema } from '../../../api/v1/organizations[:]seed/index.docs';

export class OpenApiV3Entity extends OpenApiBuilder {
  constructor() {
    super();
    this.addOpenApiVersion('3.0.0');
    this.addInfo({
      contact: {
        name: 'PeerLab',
      },
      title: 'People | Organizations Management API',
      version: '1.0.0',
    });
    this.addServer({
      url: 'http://localhost:8080',
      description: 'Local server',
    });

    this.addSchema(AgentV1Entity.name, agentV1DtoJsonSchema);
    this.addSchema(OrganizationV1Entity.name, organizationV1JsonSchema);

    this.addPath('/api/v1/organizations', organizationsV1ControllerSchema);
    this.addPath('/api/v1/organizations/{id}', v1OrganizationsIdControllerSchema);
    this.addPath('/api/v1/organizations:seed', organizationsV1SeedControllerSchema);

    this.addSchema(UserV1Entity.name, userV1JsonSchema);
  }
}
