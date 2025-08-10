import { firebaseIdFormat, iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ConvertMultiDepartmentV1InOrganizationV1Service } from '.';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity.schema.types';
import { IMultiDepartmentV1Dto } from '../../entity.schema.types';
import { multiDepartmentsV1Fixtures } from '../../fixtures';

describe('ConvertMultiDepartmentV1InOrganizationV1Service', () => {
  it('should convert the same multi-department-v1 in the same organization-v1 with correct ids', () => {
    // When
    const multiDepartmentV1Fixture = multiDepartmentsV1Fixtures[0];
    const organizationV1Dto = ConvertMultiDepartmentV1InOrganizationV1Service.execute(multiDepartmentV1Fixture);
    const organizationV1Dto2 = ConvertMultiDepartmentV1InOrganizationV1Service.execute(multiDepartmentV1Fixture);

    // Then
    const expectedOrganizationV1Dto: IOrganizationV1Dto = {
      id: '0000000066fbcd429b53a794',
      ownerAgentId: '145772106f53f316365b322a8ecc',
      agentId: '66fbcd429b53a794039f5798253d',
      email: 'placeholder-66fbcd429b53a794039f5798253d@email.com',
      nickname: 'fake-department-1-0000000066fbcd429b53a794',
      planSubscriptionName: 'FREE',
      idPath: '/0000000015a129fdfb4c7d83/00000000145772106f53f316/0000000066fbcd429b53a794',
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    };

    expect(organizationV1Dto).toEqual(expectedOrganizationV1Dto);

    // Objects should be equal except for createdAt and updatedAt
    expect({ ...organizationV1Dto, createdAt: undefined, updatedAt: undefined }).toEqual({
      ...organizationV1Dto2,
      createdAt: undefined,
      updatedAt: undefined,
    });
    expect(organizationV1Dto.ownerAgentId).not.toEqual(organizationV1Dto.agentId);
  });

  it('should convert multi-department-v1 in organization-v1 with valid attributes', () => {
    // Given
    multiDepartmentsV1Fixtures.forEach((multiDepartmentV1Fixture) => {
      // When
      const organizationV1Dto = ConvertMultiDepartmentV1InOrganizationV1Service.execute(multiDepartmentV1Fixture);

      // Then
      const generatedEmailRegex = /^placeholder-([a-f0-9]{28})@email\.com$/; // Starts with 'placeholder-', followed by a hexadecimal string of 28 characters (firebase id format), and ends with '@email.com'
      const generatedNicknameRegex = /-([a-f0-9]{24})$/; // Ends with a hexadecimal string of 24 characters that represents the multi-department-v1 id (mongodb id format)
      const mongoDbIdPathDepartmentRegex = /^\/([a-f0-9]{24})\/([a-f0-9]{24})\/([a-f0-9]{24})$/; // Starts with '/', followed by 3 hexadecimal strings of 24 characters (mongodb id format)

      const expectedOrganizationV1Dto: IOrganizationV1Dto = {
        id: expect.stringMatching(mongoDbIdFormat),
        ownerAgentId: expect.stringMatching(firebaseIdFormat),
        agentId: expect.stringMatching(firebaseIdFormat),
        email: expect.stringMatching(generatedEmailRegex),
        nickname: expect.stringMatching(generatedNicknameRegex),
        planSubscriptionName: 'FREE',
        idPath: expect.stringMatching(mongoDbIdPathDepartmentRegex),
        createdAt: expect.stringMatching(iso8601DateFormat),
        updatedAt: expect.stringMatching(iso8601DateFormat),
      };

      expect(organizationV1Dto).toEqual(expectedOrganizationV1Dto);
      expect(organizationV1Dto.ownerAgentId).not.toEqual(organizationV1Dto.agentId);
    });
  });

  it('should convert the same multi-department-v1 in the same organization-v1 with the same input', () => {
    // Given
    multiDepartmentsV1Fixtures.forEach((multiDepartmentV1Fixture) => {
      // When
      const organizationV1DtoOutput1 =
        ConvertMultiDepartmentV1InOrganizationV1Service.execute(multiDepartmentV1Fixture);
      const organizationV1DtoOutput2 =
        ConvertMultiDepartmentV1InOrganizationV1Service.execute(multiDepartmentV1Fixture);

      // Then
      expect(organizationV1DtoOutput1).toEqual({
        ...organizationV1DtoOutput2,
        updatedAt: expect.stringMatching(iso8601DateFormat),
        createdAt: expect.stringMatching(iso8601DateFormat),
      });
    });
  });

  it('should convert different multi-department-v1 in different organization-v1 with different inputs', () => {
    const comparisons = [];

    // Given
    multiDepartmentsV1Fixtures.forEach((multiDepartmentV1Fixture, index, array) => {
      // When
      const organizationV1DtoOutput1 =
        ConvertMultiDepartmentV1InOrganizationV1Service.execute(multiDepartmentV1Fixture);

      const nextIndex = index + 1 === array.length ? 0 : index + 1;
      const nextItem = array[nextIndex];
      comparisons.push({ current: multiDepartmentV1Fixture, next: nextItem });
      const organizationV1DtoOutput2 = ConvertMultiDepartmentV1InOrganizationV1Service.execute(nextItem);

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
        ConvertMultiDepartmentV1InOrganizationV1Service.execute(invalidMultiDepartmentV1Dto);
      };

      // Then
      expect(execute).toThrow();
    });
  });
});
