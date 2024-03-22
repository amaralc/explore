import { OpenApiBuilder } from 'openapi3-ts/oas30';
import { AgentV1Entity, agentV1JsonSchema } from '../../../../../../base/src/domains/agents-v1/core/entity';
import {
  OrganizationV1Entity,
  organizationV1JsonSchema,
} from '../../../../../../base/src/domains/organizations-v1/core/entity';
import { UserV1Entity, userV1JsonSchema } from '../../../../../../base/src/domains/users-v1/core/entity';
import { v1OrganizationsIdControllerSchema } from '../../../api/v1/organizations/[id]/index.docs';
import { organizationsV1ControllerSchema } from '../../../api/v1/organizations/index.docs';

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

    this.addSchema(AgentV1Entity.name, agentV1JsonSchema);

    this.addSchema(OrganizationV1Entity.name, organizationV1JsonSchema);
    this.addPath('/api/v1/organizations', organizationsV1ControllerSchema);
    this.addPath('/api/v1/organizations/{id}', v1OrganizationsIdControllerSchema);

    this.addSchema(UserV1Entity.name, userV1JsonSchema);
  }
}
