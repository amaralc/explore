import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { randomBytes } from 'crypto';
import { AgentV1Entity } from './entity';
import { IAgentV1Dto } from './entity.schema.types';
describe('AgentV1Entity', () => {
  it('should not create an agent with an invalid email', async () => {
    expect(
      () =>
        new AgentV1Entity({
          email: 'invalid-email',
          nickname: 'valid-nickname',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: randomBytes(14).toString('hex'),
          type: 'INDIVIDUAL',
        }),
    ).toThrow(ValidationExceptionV2Error);
  });
  it.each(['x', 'invalid.nickname', 'invalid/nickname', '-invalid-', '--/inv'])(
    'should not create organization entity with invalid nicknames',
    (invalidNickname) => {
      expect(
        () =>
          new AgentV1Entity({
            email: 'valid@email.com',
            nickname: invalidNickname,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            id: randomBytes(14).toString('hex'),
            type: 'INDIVIDUAL',
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );
  it('should not create an agent with nickname generated with an invalid email', async () => {
    expect(
      () =>
        new AgentV1Entity({
          email: 'valid@email.com',
          nickname: AgentV1Entity.generateNicknameFromEmail('invalid-email.com'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: randomBytes(14).toString('hex'),
          type: 'INDIVIDUAL',
        }),
    ).toThrow(ValidationExceptionV2Error);
  });
  it('should not allow creating agents with dates that do not conform to ISO date format', async () => {
    expect(
      () =>
        new AgentV1Entity({
          email: 'valid@email.com',
          nickname: AgentV1Entity.generateNicknameFromEmail('valid@email.com'),
          createdAt: '2024-01-22T00:00:00',
          updatedAt: 'invalid-date',
          id: randomBytes(14).toString('hex'),
          type: 'INDIVIDUAL',
        }),
    ).toThrow(ValidationExceptionV2Error);
  });
  it.each(['lessthan28characters', 'justalittlemorethan28characters', 'with-some.special/characters'])(
    'should not create agent with invalid id',
    async (invalidId) => {
      expect(
        () =>
          new AgentV1Entity({
            email: 'valid@email.com',
            nickname: AgentV1Entity.generateNicknameFromEmail('valid@email.com'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            id: invalidId,
            type: 'INDIVIDUAL',
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );
  it('should not allow creating agents with invalid type', async () => {
    expect(
      () =>
        new AgentV1Entity({
          email: 'valid@email.com',
          nickname: AgentV1Entity.generateNicknameFromEmail('valid@email.com'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: randomBytes(14).toString('hex'),
          type: 'invalid-type' as IAgentV1Dto['type'], // Forced type to avoid TypeScript error
        }),
    ).toThrow(ValidationExceptionV2Error);
  });
  it('should create an agent with valid input', async () => {
    expect(
      () =>
        new AgentV1Entity({
          email: 'individual@email.com',
          nickname: AgentV1Entity.generateNicknameFromEmail('valid@email.com'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: randomBytes(14).toString('hex'),
          type: 'INDIVIDUAL',
        }),
    ).not.toThrow(ValidationExceptionV2Error);
    expect(
      () =>
        new AgentV1Entity({
          email: 'organization@email.com',
          nickname: 'organization-valid-nickname',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: randomBytes(14).toString('hex'),
          type: 'ORGANIZATION',
        }),
    ).not.toThrow(ValidationExceptionV2Error);
  });
});
