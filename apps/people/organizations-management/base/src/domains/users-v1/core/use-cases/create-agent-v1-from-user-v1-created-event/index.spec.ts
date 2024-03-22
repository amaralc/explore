import { randomBytes } from 'crypto';
import { CreateAgentV1FromUserV1CreationEventUseCase } from '.';
import { AgentsV1DatabaseRepository } from '../../../../agents-v1/core/database-repository';
import { InMemoryAgentsV1Repository } from '../../../../agents-v1/core/database-repository-in-memory';
import { IAgentV1Dto } from '../../../../agents-v1/core/entity';
import { fakeAgents } from '../../../../agents-v1/core/fixtures';
import { UserV1AuthenticationEventDto, UsersV1EventsRepository } from '../../events-repository';
import { InMemoryUsersV1EventsRepository } from '../../events-repository-in-memory';

describe('createAgentV1FromUserV1CreatedEvent', () => {
  let agentsV1Repository: AgentsV1DatabaseRepository;
  let usersV1EventsRepository: UsersV1EventsRepository;
  let useCase: CreateAgentV1FromUserV1CreationEventUseCase;

  beforeEach(async () => {
    agentsV1Repository = new InMemoryAgentsV1Repository();
    usersV1EventsRepository = new InMemoryUsersV1EventsRepository();
    agentsV1Repository.createMany(fakeAgents);
    useCase = new CreateAgentV1FromUserV1CreationEventUseCase(agentsV1Repository, usersV1EventsRepository);
  });

  it('should create an agent from a user created event', async () => {
    const userCreatedEvent: UserV1AuthenticationEventDto = {
      displayName: 'New User',
      email: 'new-user@email.com',
      emailVerified: true,
      metadata: {
        createdAt: new Date().toISOString(),
        lastSignedInAt: new Date().toISOString(),
      },
      photoURL: 'https://www.photo.com/john-doe',
      providerData: [],
      uid: randomBytes(14).toString('hex'), // 28 characters hex string
    };

    const createdAgentV1 = await useCase.execute(userCreatedEvent);

    const expectedAgentV1: IAgentV1Dto = {
      createdAt: userCreatedEvent.metadata.createdAt,
      email: userCreatedEvent.email,
      id: userCreatedEvent.uid,
      type: 'INDIVIDUAL',
      updatedAt: userCreatedEvent.metadata.lastSignedInAt,
    };

    expect(createdAgentV1).toEqual(expectedAgentV1);
  });

  it('should not create an individual agent if an agent with the same email already exists', async () => {
    const userCreatedEvent: UserV1AuthenticationEventDto = {
      displayName: 'New User',
      email: fakeAgents[0].email,
      emailVerified: true,
      metadata: {
        createdAt: new Date().toISOString(),
        lastSignedInAt: new Date().toISOString(),
      },
      photoURL: 'https://www.photo.com/john-doe',
      providerData: [],
      uid: randomBytes(14).toString('hex'), // 24 characters hex string
    };

    await expect(useCase.execute(userCreatedEvent)).rejects.toThrow('Agent with same email already exists');
  });
});
