import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { Static, Type } from '@sinclair/typebox';
import 'reflect-metadata';

export const taxonomicUnitV1JsonSchema = Type.Object({
  id: Type.String({
    minLength: 24,
    maxLength: 24,
    pattern: '^[0-9a-fA-F]{24}$',
    description: 'The unique identifier of an agent as a hexadecimal string of 28 characters.',
  }),
  slug: Type.String({
    minLength: 4,
    pattern: '^(?:[a-z0-9]+(?:-[a-z0-9]+)*){4,}$', // Starts with a letter or number, followed by letters, numbers or hyphens, and ends with a letter or number with more 4 characters or more
    description: 'The slug of the taxonomic unit. It must have at least 4 characters.',
  }),
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

export type ITaxonomicUnitV1Dto = Static<typeof taxonomicUnitV1JsonSchema>;

export class TaxonomicUnitV1Entity {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;

  constructor(inputDto: ITaxonomicUnitV1Dto) {
    // Validate
    TaxonomicUnitV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: ITaxonomicUnitV1Dto) {
    schemaValidator.validateOrReject(taxonomicUnitV1JsonSchema, inputDto);
  }

  getDto(): ITaxonomicUnitV1Dto {
    const dto = getDtoFromEntity<ITaxonomicUnitV1Dto>(this);
    return dto;
  }
}
