import { faker } from '@faker-js/faker';
import { firebaseIdFormat, iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { OrganizationV1Entity } from './entity';
import { IOrganizationV1Dto } from './entity.schema.types';

describe('OrganizationV1Entity', () => {
  it('should create a valid organization entity', async () => {
    const fakeOrganizationId = faker.string.hexadecimal({ length: 24, prefix: '' });

    const organizationV1InputDto: IOrganizationV1Dto = {
      id: fakeOrganizationId,
      ownerAgentId: faker.string.hexadecimal({ length: 28, prefix: '' }),
      agentId: faker.string.hexadecimal({ length: 28, prefix: '' }),
      email: 'valid@email.com',
      nickname: 'valid-organization-nickname',
      planSubscriptionName: 'FREE',
      idPath: `/${fakeOrganizationId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(new OrganizationV1Entity(organizationV1InputDto)).toEqual({
      id: expect.stringMatching(mongoDbIdFormat),
      ownerAgentId: expect.stringMatching(firebaseIdFormat),
      agentId: expect.stringMatching(firebaseIdFormat),
      email: 'valid@email.com',
      nickname: 'valid-organization-nickname',
      planSubscriptionName: 'FREE',
      idPath: `/${fakeOrganizationId}`,
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    });
  });

  it.each(['invalid-id', faker.string.hexadecimal({ length: 28, prefix: '' })])(
    'should not create organization entity with invalid id',
    (invalidId) => {
      expect(
        () =>
          new OrganizationV1Entity({
            id: invalidId,
            ownerAgentId: faker.string.hexadecimal({ length: 28, prefix: '' }),
            agentId: faker.string.hexadecimal({ length: 28, prefix: '' }),
            email: 'valid@email.com',
            nickname: 'valid-organization-nickname',
            planSubscriptionName: 'FREE',
            idPath: `/${invalidId}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );

  it.each(['/invalid-id-path', `/${faker.string.hexadecimal({ length: 28, prefix: '' })}`])(
    'should not create organization entity with invalid id',
    (invalidIdPath) => {
      expect(
        () =>
          new OrganizationV1Entity({
            id: faker.string.hexadecimal({ length: 24, prefix: '' }),
            ownerAgentId: faker.string.hexadecimal({ length: 28, prefix: '' }),
            agentId: faker.string.hexadecimal({ length: 28, prefix: '' }),
            email: 'valid@email.com',
            nickname: 'valid-organization-nickname',
            planSubscriptionName: 'FREE',
            idPath: invalidIdPath,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );

  it('should not create organization entity with idPath that does not end with its own id', () => {
    const organizationId = faker.string.hexadecimal({ length: 24, prefix: '' });
    const otherOrganizationId = faker.string.hexadecimal({ length: 24, prefix: '' });
    const invalidPath = `/${otherOrganizationId}`;

    expect(
      () =>
        new OrganizationV1Entity({
          id: organizationId,
          ownerAgentId: faker.string.hexadecimal({ length: 28, prefix: '' }),
          agentId: faker.string.hexadecimal({ length: 28, prefix: '' }),
          email: 'valid@email.com',
          nickname: 'valid-organization-nickname',
          planSubscriptionName: 'FREE',
          idPath: invalidPath,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
    ).toThrow(ValidationExceptionV2Error);
  });

  it.each(['invalid-owner-agent-id', faker.database.mongodbObjectId().toString()])(
    'should not create organization entity with invalid owner agent id',
    (invalidOwnerAgentId) => {
      const fakeOrganizationId = faker.database.mongodbObjectId().toString();
      expect(
        () =>
          new OrganizationV1Entity({
            id: faker.database.mongodbObjectId().toString(),
            ownerAgentId: invalidOwnerAgentId,
            agentId: faker.database.mongodbObjectId().toString(),
            email: 'valid@email.com',
            nickname: 'valid-organization-nickname',
            planSubscriptionName: 'FREE',
            idPath: `/${fakeOrganizationId}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );

  it.each(['invalid-agent-id', faker.database.mongodbObjectId().toString()])(
    'should not create organization entity with invalid agent id',
    (invalidAgentId) => {
      const fakeOrganizationId = faker.database.mongodbObjectId().toString();
      expect(
        () =>
          new OrganizationV1Entity({
            id: fakeOrganizationId,
            ownerAgentId: faker.database.mongodbObjectId().toString(),
            agentId: invalidAgentId,
            email: 'valid@email.com',
            nickname: 'valid-organization-nickname',
            planSubscriptionName: 'FREE',
            idPath: `/${fakeOrganizationId}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );

  it.each(['invalid-email', 'a', 'a@b', '--@.com'])(
    'should not create organization entity with invalid emails',
    (invalidEmail) => {
      const fakeOrganizationId = faker.number.hex(24);

      expect(
        () =>
          new OrganizationV1Entity({
            id: faker.number.hex(24),
            ownerAgentId: faker.number.hex(28),
            agentId: faker.number.hex(28),
            email: invalidEmail,
            nickname: 'valid-organization-nickname',
            planSubscriptionName: 'FREE',
            idPath: `/${fakeOrganizationId}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );

  it.each(['x', 'invalid.nickname', 'invalid/nickname', '-invalid-', '--/inv'])(
    'should not create organization entity with invalid nicknames',
    (invalidNickname) => {
      const fakeOrganizationId = faker.database.mongodbObjectId().toString();
      expect(
        () =>
          new OrganizationV1Entity({
            id: faker.database.mongodbObjectId().toString(),
            ownerAgentId: faker.database.mongodbObjectId().toString(),
            agentId: faker.database.mongodbObjectId().toString(),
            email: 'valid@email.com',
            nickname: invalidNickname, // should have at least 3 characters
            planSubscriptionName: 'FREE',
            idPath: `/${fakeOrganizationId}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );

  it('should not create organization entity with invalid nickname', () => {
    const fakeOrganizationId = faker.database.mongodbObjectId().toString();
    expect(
      () =>
        new OrganizationV1Entity({
          id: faker.database.mongodbObjectId().toString(),
          ownerAgentId: faker.database.mongodbObjectId().toString(),
          agentId: faker.database.mongodbObjectId().toString(),
          email: 'valid@email.com',
          nickname: 'valid-organization-nickname',
          planSubscriptionName: 'x' as OrganizationV1Entity['planSubscriptionName'], // FREE
          idPath: `/${fakeOrganizationId}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
    ).toThrow(ValidationExceptionV2Error);
  });
});
