import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { Static, Type } from '@sinclair/typebox';
import 'reflect-metadata';

export const assetV1JsonSchema = Type.Object({
  id: Type.String({
    minLength: 24,
    maxLength: 24,
    pattern: '^[0-9a-fA-F]{24}$',
    description: 'The unique identifier of an agent as a hexadecimal string of 28 characters.',
  }),
  name: Type.String({
    minLength: 1,
    description: 'The name of the asset. It must have at least 1 character.',
  }),
  taxonomicUnitSlug: Type.String({
    minLength: 4,
    pattern: '^(?:[a-z0-9]+(?:-[a-z0-9]+)*){4,}$', // Starts with a letter or number, followed by letters, numbers or hyphens, and ends with a letter or number with more 4 characters or more
    description:
      'The slug of the taxonomic unit the asset belongs as a direct child. It must have at least 4 characters.',
  }),
  tags: Type.Array(
    Type.String({
      minLength: 1,
      pattern: '^(?:[a-z0-9]+(?:-[a-z0-9]+)*){4,}$', // Starts with a letter or number, followed by letters, numbers or hyphens, and ends with a letter or number with more 4 characters or more
      description: 'The tags of the asset. Each tag must have at least 4 characters.',
    }),
  ),
  createdAt: Type.String({
    format: 'date-time',
    description: 'The date and time when the agent was created.',
    pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$',
  }),
  updatedAt: Type.String({
    format: 'date-time',
    description: 'The date and time when the agent was last updated.',
    pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$',
  }),
});

export type IAssetV1Dto = Static<typeof assetV1JsonSchema>;

export class AssetV1Entity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;

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
