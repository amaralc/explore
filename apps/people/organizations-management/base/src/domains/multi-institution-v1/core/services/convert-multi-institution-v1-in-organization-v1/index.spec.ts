import { firebaseIdFormat, iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ConvertMultiInstitutionV1InOrganizationV1Service } from '.';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { multiInstitutionsV1Fixtures } from '../../fixtures';

describe('ConvertMultiInstitutionV1InOrganizationV1Service', () => {
  it('should convert multi-institution-v1 in organization-v1', () => {
    // Given
    const existingMultiInstitutionV1 = multiInstitutionsV1Fixtures[0];

    // When
    const organizationV1Dto = ConvertMultiInstitutionV1InOrganizationV1Service.execute(existingMultiInstitutionV1);

    // Then
    const generatedEmailRegex = /^placeholder-([a-f0-9]{28})@email\.com$/; // Starts with 'placeholder-', followed by a hexadecimal string of 24 characters, and ends with '@email.com'
    const generatedNicknameRegex = /-([a-f0-9]{24})$/; // Ends with a hexadecimal string of 24 characters

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
  });
});
