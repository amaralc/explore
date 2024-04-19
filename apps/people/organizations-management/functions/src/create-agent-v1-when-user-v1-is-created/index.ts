import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { MongoDbAgentsV1DatabaseRepository } from '@peerlab/people/organizations-management/base/domains/agents-v1/adapters/database-repository-mongodb';
import { IBackgroundFunction } from '@peerlab/people/organizations-management/base/domains/users-v1/adapters/database-repository-firebase.types';
import { FirebaseUsersV1EventsRepository } from '@peerlab/people/organizations-management/base/domains/users-v1/adapters/events-repository-firebase';
import { CreateAgentV1FromUserV1CreationEventUseCase } from '@peerlab/people/organizations-management/base/domains/users-v1/core/use-cases/create-agent-v1-from-user-v1-created-event';

export const createAgentV1WhenUserV1IsCreated: IBackgroundFunction = (eventData, context, callback) => {
  const log: {
    module: string;
    steps: Array<{ message: string; data?: unknown }>;
  } = {
    module: 'createAgentV1WhenUserV1IsCreated',
    steps: [],
  };
  log.steps.push({ message: 'Executing function createAgentV1WhenUserV1IsCreated', data: { eventData, context } });
  (async () => {
    try {
      const configurationManager = new ConfigurationManager();
      await configurationManager.initialize();
      log.steps.push({ message: 'Configuration manager initialized' });
      const databaseDriver = configurationManager.getDatabaseDriver();
      log.steps.push({ message: 'Database driver created' });
      const usersV1Events = new FirebaseUsersV1EventsRepository();
      log.steps.push({ message: 'Users V1 events repository created' });
      const agentsV1Database = new MongoDbAgentsV1DatabaseRepository(databaseDriver);
      log.steps.push({ message: 'Agents V1 database repository created' });
      const useCase = new CreateAgentV1FromUserV1CreationEventUseCase(agentsV1Database, usersV1Events);
      log.steps.push({ message: 'Use case created' });
      const agentV1Entity = await useCase.execute(eventData);
      log.steps.push({ message: 'Use case executed', data: { agent: agentV1Entity } });
      await databaseDriver.disconnect();
      log.steps.push({ message: 'Database driver disconnected' });
      log.steps.push({ message: `Agent ${agentV1Entity.id} created from user ${eventData.uid}.` });

      callback();
      console.log('createAgentV1WhenUserV1IsCreated executed successfully', log);
    } catch (error) {
      log.steps.push({ message: 'Error executing function', data: { error: error } });
      console.error('createAgentV1WhenUserV1IsCreated executed with errors', log);
      callback();
    }
  })();
};
