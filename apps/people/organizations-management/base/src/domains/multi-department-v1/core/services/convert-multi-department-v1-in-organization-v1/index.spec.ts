import { firebaseIdFormat, iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ConvertMultiDepartmentV1InOrganizationV1Service } from '.';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { IMultiDepartmentV1Dto } from '../../entity';
import { multiDepartmentsV1Fixtures } from '../../fixtures';

describe('ConvertMultiDepartmentV1InOrganizationV1Service', () => {
  it('should convert multi-department-v1 in organization-v1 with valid attributes', () => {
    // Given
    multiDepartmentsV1Fixtures.forEach((multiDepartmentV1Fixture) => {
      // When
      const organizationV1Dto = ConvertMultiDepartmentV1InOrganizationV1Service.execute({
        multiDepartmentV1Dto: multiDepartmentV1Fixture,
        ownerAgentId: '0000000000000000000000000000',
      });

      // Then
      const generatedEmailRegex = /^placeholder-([a-f0-9]{28})@email\.com$/; // Starts with 'placeholder-', followed by a hexadecimal string of 28 characters (firebase id format), and ends with '@email.com'
      const generatedNicknameRegex = /-([a-f0-9]{24})$/; // Ends with a hexadecimal string of 24 characters that represents the multi-department-v1 id (mongodb id format)

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

  it('should convert the same multi-department-v1 in the same organization-v1 with the same input', () => {
    // Given
    const fakeOwnerAgentId = '0000000000000000000000000000';

    multiDepartmentsV1Fixtures.forEach((multiDepartmentV1Fixture) => {
      // When
      const organizationV1DtoOutput1 = ConvertMultiDepartmentV1InOrganizationV1Service.execute({
        multiDepartmentV1Dto: multiDepartmentV1Fixture,
        ownerAgentId: fakeOwnerAgentId,
      });
      const organizationV1DtoOutput2 = ConvertMultiDepartmentV1InOrganizationV1Service.execute({
        multiDepartmentV1Dto: multiDepartmentV1Fixture,
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

  it('should convert different multi-department-v1 in different organization-v1 with different inputs', () => {
    // Given
    const fakeOwnerAgentId = '0000000000000000000000000000';

    multiDepartmentsV1Fixtures.forEach((multiDepartmentV1Fixture, index, array) => {
      // When
      const organizationV1DtoOutput1 = ConvertMultiDepartmentV1InOrganizationV1Service.execute({
        multiDepartmentV1Dto: multiDepartmentV1Fixture,
        ownerAgentId: fakeOwnerAgentId,
      });
      const organizationV1DtoOutput2 = ConvertMultiDepartmentV1InOrganizationV1Service.execute({
        multiDepartmentV1Dto: array[(index + 1) % array.length],
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

  it('should throw an error when multi-department-v1 dto is invalid', () => {
    // Given
    const invalidMultiDepartmentV1DtoList = [
      {
        ...multiDepartmentsV1Fixtures[0],
        id: -1,
      },
      {
        ...multiDepartmentsV1Fixtures[0],
        id: 4294967296,
      },
      {
        ...multiDepartmentsV1Fixtures[0],
        id: 1.5,
      },
      {
        ...multiDepartmentsV1Fixtures[0],
        id: '1',
      },
      {
        ...multiDepartmentsV1Fixtures[0],
        id: undefined,
      },
      {
        ...multiDepartmentsV1Fixtures[0],
        nome: undefined,
      },
      {},
      {
        id: 1,
      },
      1,
      'invalid-multi-department-v1-dto',
      {
        ...multiDepartmentsV1Fixtures[0],
        instituicao_id: '1',
      },
      {
        ...multiDepartmentsV1Fixtures[0],
        unidade_id: -1,
      },
    ] as unknown as Array<IMultiDepartmentV1Dto>;

    invalidMultiDepartmentV1DtoList.forEach((invalidMultiDepartmentV1Dto) => {
      // When
      const execute = () => {
        ConvertMultiDepartmentV1InOrganizationV1Service.execute({
          multiDepartmentV1Dto: invalidMultiDepartmentV1Dto,
          ownerAgentId: '0000000000000000000000000000',
        });
      };

      // Then
      expect(execute).toThrow();
    });
  });
});
