import { AssetV1Entity, assetV1JsonSchema } from '@peerlab/things/assets-catalog/base/domains/assets-v1/core/entity';
import {
  TaxonomicUnitV1Entity,
  taxonomicUnitV1JsonSchema,
} from '@peerlab/things/assets-catalog/base/domains/taxonomic-units-v1/core/entity';
import { OpenApiBuilder } from 'openapi3-ts/oas30';
import { assetsV1ControllerSchema } from '../../../api/v1/assets/index.docs';
import { taxonomicUnitV1ControllerSchema } from '../../../api/v1/taxonomic-units/index.docs';

export class OpenApiV3Entity extends OpenApiBuilder {
  constructor() {
    super();
    this.addOpenApiVersion('3.0.0');
    this.addInfo({
      contact: {
        name: 'PeerLab',
      },
      title: 'Things | Assets Catalog API',
      version: '1.0.0',
    });
    this.addServer({
      url: 'http://localhost:8080',
      description: 'Local server',
    });

    this.addSchema(TaxonomicUnitV1Entity.name, taxonomicUnitV1JsonSchema);
    this.addPath('/api/v1/organizations', taxonomicUnitV1ControllerSchema);

    this.addSchema(AssetV1Entity.name, assetV1JsonSchema);
    this.addPath('/api/v1/assets', assetsV1ControllerSchema);
  }
}
