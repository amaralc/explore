import { firebaseIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ConvertMultiCentralV1InOrganizationV1Service } from '.';
import { IMultiCentralV1Dto } from '../../entity.schema.types';
import { multiCentralsV1Fixtures } from '../../fixtures';
describe('ConvertMultiCentralV1InOrganizationV1Service', () => {
  it('should convert multi-central-v1 in organization-v1 with valid attributes', () => {
    // Given
    const multiCentralV1Dto = multiCentralsV1Fixtures[0];
    const inputDto: IMultiCentralV1Dto = multiCentralV1Dto;
    // When
    const organizationV1Dto = ConvertMultiCentralV1InOrganizationV1Service.execute(inputDto);
    // Then
    const generatedNicknameRegex = /-([a-f0-9]{24})$/; // Ends with a hexadecimal string of 24 characters that represents the multi-institution-v1 id (mongodb id format)
    const expectedIdPath =
      '/0000000015a129fdfb4c7d83/00000000145772106f53f316/0000000066fbcd429b53a794/000000004685a776b3e55278';
    const expectedOrganizationV1Dto = {
      id: '000000004685a776b3e55278',
      ownerAgentId: expect.stringMatching(firebaseIdFormat),
      agentId: expect.stringMatching(firebaseIdFormat),
      email: multiCentralV1Dto.email,
      nickname: expect.stringMatching(generatedNicknameRegex),
      planSubscriptionName: 'FREE',
      idPath: expectedIdPath,
      createdAt: multiCentralV1Dto.created,
      updatedAt: multiCentralV1Dto.updated,
    };
    expect(organizationV1Dto).toEqual(expectedOrganizationV1Dto);
    expect(organizationV1Dto.ownerAgentId).not.toEqual(organizationV1Dto.agentId);
  });
});
