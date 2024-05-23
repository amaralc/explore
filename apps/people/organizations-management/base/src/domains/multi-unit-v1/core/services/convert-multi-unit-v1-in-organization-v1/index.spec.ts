import { firebaseIdFormat, iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ConvertMultiUnitV1InOrganizationV1Service } from '.';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { IMultiUnitV1Dto } from '../../entity';
import { multiUnitsV1Fixtures } from '../../fixtures';

describe('ConvertMultiUnitV1InOrganizationV1Service', () => {
  it('should convert multi-unit-v1 in organization-v1 with valid attributes', () => {
    // Given
    multiUnitsV1Fixtures.forEach((multiUnitV1Fixture) => {
      // When
      const organizationV1Dto = ConvertMultiUnitV1InOrganizationV1Service.execute({
        multiUnitV1Dto: multiUnitV1Fixture,
        ownerAgentId: '0000000000000000000000000000',
      });

      // Then
      const generatedEmailRegex = /^placeholder-([a-f0-9]{28})@email\.com$/; // Starts with 'placeholder-', followed by a hexadecimal string of 28 characters (firebase id format), and ends with '@email.com'
      const generatedNicknameRegex = /-([a-f0-9]{24})$/; // Ends with a hexadecimal string of 24 characters that represents the multi-unit-v1 id (mongodb id format)

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

  it('should convert the same multi-unit-v1 in the same organization-v1 with the same input', () => {
    // Given
    const fakeOwnerAgentId = '0000000000000000000000000000';

    multiUnitsV1Fixtures.forEach((multiUnitV1Fixture) => {
      // When
      const organizationV1DtoOutput1 = ConvertMultiUnitV1InOrganizationV1Service.execute({
        multiUnitV1Dto: multiUnitV1Fixture,
        ownerAgentId: fakeOwnerAgentId,
      });
      const organizationV1DtoOutput2 = ConvertMultiUnitV1InOrganizationV1Service.execute({
        multiUnitV1Dto: multiUnitV1Fixture,
        ownerAgentId: fakeOwnerAgentId,
      });

      // Then
      expect(organizationV1DtoOutput1).toEqual({
        ...organizationV1DtoOutput2,
        updatedAt: expect.stringMatching(iso8601DateFormat),
        createdAt: expect.stringMatching(iso8601DateFormat),
      });
    });
  });

  it('should convert different multi-unit-v1 in different organization-v1 with different inputs', () => {
    // Given
    const fakeOwnerAgentId = '0000000000000000000000000000';

    multiUnitsV1Fixtures.forEach((multiUnitV1Fixture, index, array) => {
      // When
      const organizationV1DtoOutput1 = ConvertMultiUnitV1InOrganizationV1Service.execute({
        multiUnitV1Dto: multiUnitV1Fixture,
        ownerAgentId: fakeOwnerAgentId,
      });
      const organizationV1DtoOutput2 = ConvertMultiUnitV1InOrganizationV1Service.execute({
        multiUnitV1Dto: array[(index + 1) % array.length],
        ownerAgentId: fakeOwnerAgentId,
      });

      // Then
      expect(organizationV1DtoOutput1).not.toEqual({
        ...organizationV1DtoOutput2,
        updatedAt: expect.stringMatching(iso8601DateFormat),
        createdAt: expect.stringMatching(iso8601DateFormat),
      });
    });
  });

  it('should throw an error when multi-unit-v1 dto is invalid', () => {
    // Given
    const invalidMultiUnitV1DtoList = [
      {
        ...multiUnitsV1Fixtures[0],
        id: -1,
      },
      {
        ...multiUnitsV1Fixtures[0],
        id: 4294967296,
      },
      {
        ...multiUnitsV1Fixtures[0],
        id: 1.5,
      },
      {
        ...multiUnitsV1Fixtures[0],
        id: '1',
      },
      {
        ...multiUnitsV1Fixtures[0],
        id: undefined,
      },
      {
        ...multiUnitsV1Fixtures[0],
        sigla: undefined,
      },
      {},
      {
        id: 1,
      },
      1,
      'invalid-multi-unit-v1-dto',
    ] as unknown as Array<IMultiUnitV1Dto>;

    invalidMultiUnitV1DtoList.forEach((invalidMultiUnitV1Dto) => {
      // When
      const execute = () => {
        ConvertMultiUnitV1InOrganizationV1Service.execute({
          multiUnitV1Dto: invalidMultiUnitV1Dto,
          ownerAgentId: '0000000000000000000000000000',
        });
      };

      // Then
      expect(execute).toThrow();
    });
  });
});
