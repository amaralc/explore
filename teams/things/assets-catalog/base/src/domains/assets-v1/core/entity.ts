import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema';
import assetV1JsonSchema from './entity.schema';
import { IAssetV1Dto } from './entity.schema.types';

// Entity

export class AssetV1Entity implements IAssetV1Dto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  taxonomicUnitSlug: string;
  tags: string[];

  constructor(inputDto: IAssetV1Dto) {
    // Validate
    AssetV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: IAssetV1Dto) {
    schemaValidator.validateOrReject(assetV1JsonSchema, inputDto);
  }

  getDto(): IAssetV1Dto {
    const dto = getDtoFromEntity<IAssetV1Dto>(this);
    return dto;
  }
}
