import { firebaseIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ConvertMultiCentralV1InAgentV1Service } from '.';
import { multiCentralsV1Fixtures } from '../../fixtures';
describe('ConvertMultiCentralV1InAgentV1Service', () => {
  it('should convert multi-central-v1 in the same agent-v1 with valid attributes', () => {
    // Given
    const multiCentralV1 = multiCentralsV1Fixtures[0];
    // When
    const agentV1Dto = ConvertMultiCentralV1InAgentV1Service.execute(multiCentralV1);
    const agentV1Dto2 = ConvertMultiCentralV1InAgentV1Service.execute(multiCentralV1);
    // Then
    const generatedNicknameRegex = /-([a-f0-9]{28})$/; // Ends with a hexadecimal string of 24 characters
    const expectedAgentV1Dto = {
      id: expect.stringMatching(firebaseIdFormat),
      type: 'ORGANIZATION',
      email: multiCentralV1.email,
      nickname: expect.stringMatching(generatedNicknameRegex),
      createdAt: multiCentralV1.created,
      updatedAt: multiCentralV1.updated,
    };
    expect(agentV1Dto).toEqual(expectedAgentV1Dto);
    expect(agentV1Dto2).toEqual(agentV1Dto);
  });
});
