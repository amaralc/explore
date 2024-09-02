import { TaxonomicUnitInstanceV1Entity } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-instance-v1/core/entity';
import taxonomicUnitInstanceV1JsonSchema from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-instance-v1/core/entity.schema';
import taxonomicUnitV1JsonSchema from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/entity.schema';
import { OpenApiBuilder } from 'openapi3-ts/oas30';
import { TaxonomicUnitV1Entity } from '../../../../../../base/src/domains/taxonomic-unit-v1/core/entity';
import { taxonomicUnitInstancesV1Schema } from '../../../api/v1/taxonomic-units/-/instances/index.docs';
import { taxonomicUnitsV1ByIdControllerSchema } from '../../../api/v1/taxonomic-units/[id]/index.docs';
import { taxonomicUnitsV1Schema } from '../../../api/v1/taxonomic-units/index.docs';

export class OpenApiV3Entity extends OpenApiBuilder {
  constructor() {
    super();
    this.addOpenApiVersion('3.0.0');
    this.addInfo({
      contact: {
        name: 'PeerLab',
      },
      title: 'Kernel | Taxonomic Units API',
      version: '1.0.0',
    });
    this.addServer({ url: 'http://localhost:8080', description: 'Local server' });

    this.addSchema(TaxonomicUnitV1Entity.name, taxonomicUnitV1JsonSchema);
    this.addPath('/api/v1/taxonomic-units', taxonomicUnitsV1Schema);
    this.addPath('/api/v1/taxonomic-units/{id}', taxonomicUnitsV1ByIdControllerSchema);

    this.addSchema(TaxonomicUnitInstanceV1Entity.name, taxonomicUnitInstanceV1JsonSchema);
    this.addPath('/api/v1/taxonomic-units/-/instances', taxonomicUnitInstancesV1Schema);
  }
}
