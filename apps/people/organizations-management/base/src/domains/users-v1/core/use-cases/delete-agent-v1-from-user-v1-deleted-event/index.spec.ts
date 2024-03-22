import { DeleteAgentV1FromUserV1DeletedEventUseCase } from '.';
import { AgentsV1DatabaseRepository } from '../../../../agents-v1/core/database-repository';
import { InMemoryAgentsV1Repository } from '../../../../agents-v1/core/database-repository-in-memory';
import { fakeAgents } from '../../../../agents-v1/core/fixtures';
import { UserV1AuthenticationEventDto } from '../../events-repository';

describe('Delete AgentV1 from UserV1 deleted event', () => {
  let agentsV1Repository: AgentsV1DatabaseRepository;
  let useCase: DeleteAgentV1FromUserV1DeletedEventUseCase;

  beforeEach(async () => {
    agentsV1Repository = new InMemoryAgentsV1Repository();
    agentsV1Repository.createMany(fakeAgents);
    useCase = new DeleteAgentV1FromUserV1DeletedEventUseCase(agentsV1Repository);
  });

  it('should delete an agent from a user deleted event', async () => {
    const userDeletedEvent: UserV1AuthenticationEventDto = {
      displayName: 'New User',
      email: fakeAgents[0].email,
      emailVerified: true,
      metadata: {
        createdAt: new Date().toISOString(),
        lastSignedInAt: new Date().toISOString(),
      },
      photoURL: 'https://www.photo.com/john-doe',
      providerData: [],
      uid: fakeAgents[0].id, // 28 characters hex string
    };

    await useCase.execute(userDeletedEvent);
    const agentV1 = await agentsV1Repository.getByEmailAndType(userDeletedEvent.email, 'INDIVIDUAL');
    expect(agentV1).toEqual(null);
  });
});
