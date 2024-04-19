import { faker } from '@faker-js/faker';
import { firebaseIdFormat, iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { OrganizationV1Entity } from './entity';

describe('OrganizationV1Entity', () => {
  it('should create a valid organization entity', async () => {
    expect(
      new OrganizationV1Entity({
        id: faker.database.mongodbObjectId().toString(),
        ownerAgentId: faker.database.mongodbObjectId().toString(),
        agentId: faker.database.mongodbObjectId().toString(),
        email: 'valid@email.com',
        nickname: 'valid-organization-nickname',
        planSubscriptionName: 'FREE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ).toEqual({
      id: expect.stringMatching(mongoDbIdFormat),
      ownerAgentId: expect.stringMatching(firebaseIdFormat),
      agentId: expect.stringMatching(firebaseIdFormat),
      email: 'valid@email.com',
      nickname: 'valid-organization-nickname',
      planSubscriptionName: 'FREE',
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    });
  });

  it('should not create organization entity with invalid id', () => {
    expect(
      () =>
        new OrganizationV1Entity({
          id: 'invalid-id',
          ownerAgentId: faker.database.mongodbObjectId().toString(),
          agentId: faker.database.mongodbObjectId().toString(),
          email: 'valid@email.com',
          nickname: 'valid-organization-nickname',
          planSubscriptionName: 'FREE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
    ).toThrow(ValidationExceptionV2Error);
  });

  it('should not create organization entity with invalid owner agent id', () => {
    expect(
      () =>
        new OrganizationV1Entity({
          id: faker.database.mongodbObjectId().toString(),
          ownerAgentId: 'invalid-owner-agent-id',
          agentId: faker.database.mongodbObjectId().toString(),
          email: 'valid@email.com',
          nickname: 'valid-organization-nickname',
          planSubscriptionName: 'FREE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
    ).toThrow(ValidationExceptionV2Error);
  });

  it('should not create organization entity with invalid agent id', () => {
    expect(
      () =>
        new OrganizationV1Entity({
          id: faker.database.mongodbObjectId().toString(),
          ownerAgentId: faker.database.mongodbObjectId().toString(),
          agentId: 'invalid-agent-id',
          email: 'valid@email.com',
          nickname: 'valid-organization-nickname',
          planSubscriptionName: 'FREE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
    ).toThrow(ValidationExceptionV2Error);
  });

  it.each(['invalid-email', 'a', 'a@b', '--@.com'])(
    'should not create organization entity with invalid emails',
    (invalidEmail) => {
      expect(
        () =>
          new OrganizationV1Entity({
            id: faker.database.mongodbObjectId().toString(),
            ownerAgentId: faker.database.mongodbObjectId().toString(),
            agentId: faker.database.mongodbObjectId().toString(),
            email: invalidEmail,
            nickname: 'valid-organization-nickname',
            planSubscriptionName: 'FREE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );

  it.each(['x', 'invalid.nickname', 'invalid/nickname', '-invalid-', '--/inv'])(
    'should not create organization entity with invalid nicknames',
    (invalidNickname) => {
      expect(
        () =>
          new OrganizationV1Entity({
            id: faker.database.mongodbObjectId().toString(),
            ownerAgentId: faker.database.mongodbObjectId().toString(),
            agentId: faker.database.mongodbObjectId().toString(),
            email: 'valid@email.com',
            nickname: invalidNickname, // should have at least 3 characters
            planSubscriptionName: 'FREE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );

  it('should not create organization entity with invalid nickname', () => {
    expect(
      () =>
        new OrganizationV1Entity({
          id: faker.database.mongodbObjectId().toString(),
          ownerAgentId: faker.database.mongodbObjectId().toString(),
          agentId: faker.database.mongodbObjectId().toString(),
          email: 'valid@email.com',
          nickname: 'valid-organization-nickname',
          planSubscriptionName: 'x' as OrganizationV1Entity['planSubscriptionName'], // FREE
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
    ).toThrow(ValidationExceptionV2Error);
  });
});
