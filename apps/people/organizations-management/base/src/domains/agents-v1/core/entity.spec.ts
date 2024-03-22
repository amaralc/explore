import { randomBytes } from 'crypto';
import { AgentV1Entity, IAgentV1Dto } from './entity';

describe('AgentV1Entity', () => {
  it('should not create an agent with an invalid email', async () => {
    expect(
      () =>
        new AgentV1Entity({
          email: 'invalid-email',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: randomBytes(14).toString('hex'),
          type: 'INDIVIDUAL',
        }),
    ).toThrow('Invalid input used to create AgentV1Entity');
  });

  it('should not allow creating agents with dates that do not conform to ISO date format', async () => {
    expect(
      () =>
        new AgentV1Entity({
          email: 'valid@email.com',
          createdAt: '2024-01-22T00:00:00',
          updatedAt: 'invalid-date',
          id: randomBytes(14).toString('hex'),
          type: 'INDIVIDUAL',
        }),
    ).toThrow('Invalid input used to create AgentV1Entity');
  });

  it('should have id as 28 characters alpha numeric upper and lower case string', async () => {
    ['lessthan28characters', 'justalittlemorethan28characters', 'with-some.special/characters'].forEach((invalidId) => {
      expect(
        () =>
          new AgentV1Entity({
            email: 'valid@email.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            id: invalidId,
            type: 'INDIVIDUAL',
          }),
      ).toThrow('Invalid input used to create AgentV1Entity');
    });
  });

  it('should not allow creating agents with invalid type', async () => {
    expect(
      () =>
        new AgentV1Entity({
          email: 'valid@email.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: randomBytes(14).toString('hex'),
          type: 'invalid-type' as IAgentV1Dto['type'], // Forced type to avoid TypeScript error
        }),
    ).toThrow('Invalid input used to create AgentV1Entity');
  });

  it('should create an agent with valid input', async () => {
    expect(
      () =>
        new AgentV1Entity({
          email: 'individual@email.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: randomBytes(14).toString('hex'),
          type: 'INDIVIDUAL',
        }),
    ).not.toThrow('Invalid input used to create AgentV1Entity');

    expect(
      () =>
        new AgentV1Entity({
          email: 'organization@email.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: randomBytes(14).toString('hex'),
          type: 'ORGANIZATION',
        }),
    ).not.toThrow('Invalid input used to create AgentV1Entity');
  });
});
