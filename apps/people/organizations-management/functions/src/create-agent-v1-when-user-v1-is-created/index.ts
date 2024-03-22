import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { MongoDbAgentsV1DatabaseRepository } from '@peerlab/people/organizations-management/base/domains/agents-v1/adapters/database-repository-mongodb';
import { AgentV1Entity } from '@peerlab/people/organizations-management/base/domains/agents-v1/core/entity';
import { IBackgroundFunction } from '@peerlab/people/organizations-management/base/domains/users-v1/adapters/database-repository-firebase.types';
import { FirebaseUsersV1EventsRepository } from '@peerlab/people/organizations-management/base/domains/users-v1/adapters/events-repository-firebase';
import { CreateAgentV1FromUserV1CreationEventUseCase } from '@peerlab/people/organizations-management/base/domains/users-v1/core/use-cases/create-agent-v1-from-user-v1-created-event';

export const createAgentV1WhenUserV1IsCreated: IBackgroundFunction = (eventData, context, callback) => {
  console.log('Executing function createAgentV1WhenUserV1IsCreated');
  console.log('Event data', JSON.stringify(eventData));
  console.log('Context', JSON.stringify(context));
  (async () => {
    let agentV1Entity: AgentV1Entity | undefined;
    try {
      const configurationManager = new ConfigurationManager();
      await configurationManager.initialize();
      const databaseDriver = configurationManager.getDatabaseDriver();
      const usersV1Events = new FirebaseUsersV1EventsRepository();
      const agentsV1Database = new MongoDbAgentsV1DatabaseRepository(databaseDriver);
      const useCase = new CreateAgentV1FromUserV1CreationEventUseCase(agentsV1Database, usersV1Events);
      const agentV1Entity = await useCase.execute(eventData);
      await databaseDriver.disconnect();
      console.log(`Agent ${agentV1Entity.id} created from user ${eventData.uid}.`);
      callback();
    } catch (error) {
      console.log('agentV1Entity', agentV1Entity);
      console.error('createAgentV1WhenUserV1IsCreated error', error);
      callback();
    }
  })();
};
