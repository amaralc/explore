import { firebaseIdFormat, iso8601DateFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { randomBytes } from 'crypto';
import { ConvertMultiUnitV1InAgentV1Service } from '.';
import { IMultiUnitV1Dto } from '../../entity';

describe('ConvertMultiUnitV1InAgentV1Service', () => {
  it('should convert a multi-unit-v1 dto to the same agent-v1 dto given the same input', () => {
    // Arrange
    const randomMultiUnitsV1: Array<IMultiUnitV1Dto> = Array.from({ length: 10 }, () => ({
      id: Math.round(Math.random() * 4294967295),
      sigla: randomBytes(10).toString('hex'),
      nome: randomBytes(10).toString('hex'),
      instituicao_id: Math.round(Math.random() * 4294967295),
    }));

    randomMultiUnitsV1.forEach((randomMultiInstitutionV1) => {
      // Act
      const outputDto1 = ConvertMultiUnitV1InAgentV1Service.execute(randomMultiInstitutionV1);
      const outputDto2 = ConvertMultiUnitV1InAgentV1Service.execute(randomMultiInstitutionV1);

      // Assert
      const generatedEmailRegex = /^placeholder-([a-f0-9]{28})@email\.com$/; // Starts with 'placeholder-', followed by a hexadecimal string of 28 characters, and ends with '@email.com'
      const generatedNicknameRegex = /-([a-f0-9]{28})$/; // Ends with a hexadecimal string of 28 characters

      const expectedOutputDto = {
        id: expect.stringMatching(firebaseIdFormat),
        type: 'ORGANIZATION',
        email: expect.stringMatching(generatedEmailRegex),
        nickname: expect.stringMatching(generatedNicknameRegex),
        createdAt: expect.stringMatching(iso8601DateFormat),
        updatedAt: expect.stringMatching(iso8601DateFormat),
      };

      expect(outputDto1).toEqual(expectedOutputDto);
      expect(outputDto2).toEqual(expectedOutputDto);
      expect(outputDto1.id).toEqual(outputDto2.id);
    });
  });
});
