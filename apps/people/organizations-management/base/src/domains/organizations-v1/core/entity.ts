import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import 'reflect-metadata';
import organizationV1JsonSchema from './entity.schema';
import { IOrganizationV1Dto } from './entity.schema.types';

export class OrganizationV1Entity implements IOrganizationV1Dto {
  id: string;
  nickname: string;
  email: string;
  agentId: string;
  ownerAgentId: string;
  planSubscriptionName: IOrganizationV1Dto['planSubscriptionName'];
  idPath: string;
  createdAt: string;
  updatedAt: string;

  constructor(inputDto: IOrganizationV1Dto) {
    // Validate
    OrganizationV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: IOrganizationV1Dto) {
    schemaValidator.validateOrReject(organizationV1JsonSchema, inputDto);
    OrganizationV1Entity.validateIdPath(inputDto);
  }

  getDto(): IOrganizationV1Dto {
    const dto = getDtoFromEntity<IOrganizationV1Dto>(this);
    return dto;
  }

  getIdPathArray(): Array<string> {
    return this.idPath.split('/').filter((id) => id !== '');
  }

  static validateIdPath(inputDto: IOrganizationV1Dto) {
    const endsWithId = inputDto.idPath.endsWith(inputDto.id);
    if (!endsWithId) {
      throw new ValidationExceptionV2Error([
        {
          message: 'should end with the organization id',
          keyword: 'idPath',
          instancePath: 'idPath',
          schemaPath: '/idPath',
          params: {},
        },
      ]);
    }
  }
}
