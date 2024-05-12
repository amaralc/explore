import { firebaseIdFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ConvertMultiCentralV1InOrganizationV1Service } from '.';
import { multiCentralsV1Fixtures } from '../../fixtures';
import { ConvertMultiCentralV1InAgentV1Service } from '../convert-multi-central-v1-in-agent-v1';
import { IConvertMultiCentralV1InOrganizationV1InputDto } from './dto';

describe('ConvertMultiCentralV1InOrganizationV1Service', () => {
  it('should convert multi-central-v1 in organization-v1 with valid attributes', () => {
    // Given
    const multiCentralV1 = multiCentralsV1Fixtures[0];

    const agentV1 = ConvertMultiCentralV1InAgentV1Service.execute(multiCentralV1);

    const inputDto: IConvertMultiCentralV1InOrganizationV1InputDto = {
      multiCentralV1,
      agentV1,
      ownerAgentId: '0000000000000000000000000000',
    };

    // When
    const organizationV1Dto = ConvertMultiCentralV1InOrganizationV1Service.execute(inputDto);

    // Then
    const generatedNicknameRegex = /-([a-f0-9]{24})$/; // Ends with a hexadecimal string of 24 characters that represents the multi-institution-v1 id (mongodb id format)

    const expectedOrganizationV1Dto = {
      id: expect.stringMatching(mongoDbIdFormat),
      ownerAgentId: expect.stringMatching(firebaseIdFormat),
      agentId: expect.stringMatching(firebaseIdFormat),
      email: multiCentralV1.email,
      nickname: expect.stringMatching(generatedNicknameRegex),
      planSubscriptionName: 'FREE',
      createdAt: multiCentralV1.created,
      updatedAt: multiCentralV1.updated,
    };

    expect(organizationV1Dto).toEqual(expectedOrganizationV1Dto);
    expect(organizationV1Dto.ownerAgentId).not.toEqual(organizationV1Dto.agentId);
  });
});
