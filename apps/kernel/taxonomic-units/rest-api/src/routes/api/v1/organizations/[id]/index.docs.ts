import { PathItemObject } from 'openapi3-ts/oas30';
import { getV1OrganizationIdSchema } from './get.docs';

export const v1OrganizationsIdControllerSchema: PathItemObject = {
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
        minLength: 24,
        maxLength: 24,
        pattern: '^[0-9a-fA-F]{24}$',
        description: 'The unique identifier of an agent as a hexadecimal string of 28 characters.',
      },
    },
  ],
  description: 'Manage specific organization resource',
  get: getV1OrganizationIdSchema,
};
