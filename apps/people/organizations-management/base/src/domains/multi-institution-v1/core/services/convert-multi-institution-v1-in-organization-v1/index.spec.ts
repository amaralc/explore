import { firebaseIdFormat, iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ConvertMultiInstitutionV1InOrganizationV1Service } from '.';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { IMultiInstitutionV1Dto } from '../../entity';
import { multiInstitutionsV1Fixtures } from '../../fixtures';
import { ConvertMultiInstitutionV1InAgentV1Service } from '../convert-multi-institution-v1-in-agent-v1';

describe('ConvertMultiInstitutionV1InOrganizationV1Service', () => {
  it('should convert multi-institution-v1 in organization-v1 with valid attributes', () => {
    // Given
    multiInstitutionsV1Fixtures.forEach((multiInstitutionV1Fixture) => {
      // When
      const agentV1Dto = ConvertMultiInstitutionV1InAgentV1Service.execute(multiInstitutionV1Fixture);
      const organizationV1Dto = ConvertMultiInstitutionV1InOrganizationV1Service.execute({
        multiInstitutionV1Dto: multiInstitutionV1Fixture,
        ownerAgentId: '0000000000000000000000000000',
        agentV1Dto,
      });

      // Then
      const generatedEmailRegex = /^placeholder-([a-f0-9]{28})@email\.com$/; // Starts with 'placeholder-', followed by a hexadecimal string of 28 characters (firebase id format), and ends with '@email.com'
      const generatedNicknameRegex = /-([a-f0-9]{24})$/; // Ends with a hexadecimal string of 24 characters that represents the multi-institution-v1 id (mongodb id format)

      const expectedOrganizationV1Dto: IOrganizationV1Dto = {
        id: expect.stringMatching(mongoDbIdFormat),
        ownerAgentId: expect.stringMatching(firebaseIdFormat),
        agentId: expect.stringMatching(firebaseIdFormat),
        email: expect.stringMatching(generatedEmailRegex),
        nickname: expect.stringMatching(generatedNicknameRegex),
        planSubscriptionName: 'FREE',
        createdAt: expect.stringMatching(iso8601DateFormat),
        updatedAt: expect.stringMatching(iso8601DateFormat),
      };

      expect(organizationV1Dto).toEqual(expectedOrganizationV1Dto);
      expect(organizationV1Dto.ownerAgentId).not.toEqual(organizationV1Dto.agentId);
    });
  });

  it('should convert the same multi-institution-v1 in the same organization-v1 with the same input', () => {
    // Given
    const fakeOwnerAgentId = '0000000000000000000000000000';

    multiInstitutionsV1Fixtures.forEach((multiInstitutionV1Fixture) => {
      // When
      const agentV1Dto = ConvertMultiInstitutionV1InAgentV1Service.execute(multiInstitutionV1Fixture);
      const organizationV1DtoOutput1 = ConvertMultiInstitutionV1InOrganizationV1Service.execute({
        multiInstitutionV1Dto: multiInstitutionV1Fixture,
        ownerAgentId: fakeOwnerAgentId,
        agentV1Dto,
      });
      const organizationV1DtoOutput2 = ConvertMultiInstitutionV1InOrganizationV1Service.execute({
        multiInstitutionV1Dto: multiInstitutionV1Fixture,
        ownerAgentId: fakeOwnerAgentId,
        agentV1Dto,
      });

      // Then
      expect(organizationV1DtoOutput1).toEqual({
        ...organizationV1DtoOutput2,
        updatedAt: expect.stringMatching(iso8601DateFormat),
        createdAt: expect.stringMatching(iso8601DateFormat),
      });
    });
  });

  it('should convert different multi-institution-v1 in different organization-v1 with different inputs', () => {
    // Given
    const fakeOwnerAgentId = '0000000000000000000000000000';

    multiInstitutionsV1Fixtures.forEach((multiInstitutionV1Fixture, index, array) => {
      // When
      const agentV1Dto = ConvertMultiInstitutionV1InAgentV1Service.execute(multiInstitutionV1Fixture);
      const organizationV1DtoOutput1 = ConvertMultiInstitutionV1InOrganizationV1Service.execute({
        multiInstitutionV1Dto: multiInstitutionV1Fixture,
        ownerAgentId: fakeOwnerAgentId,
        agentV1Dto,
      });
      const organizationV1DtoOutput2 = ConvertMultiInstitutionV1InOrganizationV1Service.execute({
        multiInstitutionV1Dto: array[(index + 1) % array.length],
        ownerAgentId: fakeOwnerAgentId,
        agentV1Dto,
      });

      // Then
      expect(organizationV1DtoOutput1).not.toEqual({
        ...organizationV1DtoOutput2,
        updatedAt: expect.stringMatching(iso8601DateFormat),
        createdAt: expect.stringMatching(iso8601DateFormat),
      });
    });
  });

  it('should throw an error when multi-institution-v1 dto is invalid', () => {
    // Given
    const invalidMultiInstitutionV1DtoList = [
      {
        ...multiInstitutionsV1Fixtures[0],
        id: -1,
      },
      {
        ...multiInstitutionsV1Fixtures[0],
        id: 4294967296,
      },
      {
        ...multiInstitutionsV1Fixtures[0],
        id: 1.5,
      },
      {
        ...multiInstitutionsV1Fixtures[0],
        id: '1',
      },
      {
        ...multiInstitutionsV1Fixtures[0],
        id: undefined,
      },
      {
        ...multiInstitutionsV1Fixtures[0],
        sigla: undefined,
      },
      {},
      {
        id: 1,
      },
      1,
      'invalid-multi-institution-v1-dto',
    ] as unknown as Array<IMultiInstitutionV1Dto>;

    invalidMultiInstitutionV1DtoList.forEach((invalidMultiInstitutionV1Dto) => {
      // When
      const execute = () => {
        const agentV1Dto = ConvertMultiInstitutionV1InAgentV1Service.execute(invalidMultiInstitutionV1Dto);
        ConvertMultiInstitutionV1InOrganizationV1Service.execute({
          multiInstitutionV1Dto: invalidMultiInstitutionV1Dto,
          ownerAgentId: '0000000000000000000000000000',
          agentV1Dto,
        });
      };

      // Then
      expect(execute).toThrow();
    });
  });
});
