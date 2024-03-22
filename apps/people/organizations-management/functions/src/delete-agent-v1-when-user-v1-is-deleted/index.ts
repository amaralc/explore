import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { MongoDbAgentsV1DatabaseRepository } from '@peerlab/people/organizations-management/base/domains/agents-v1/adapters/database-repository-mongodb';
import { IBackgroundFunction } from '@peerlab/people/organizations-management/base/domains/users-v1/adapters/database-repository-firebase.types';
import { DeleteAgentV1FromUserV1DeletedEventUseCase } from '@peerlab/people/organizations-management/base/domains/users-v1/core/use-cases/delete-agent-v1-from-user-v1-deleted-event';

export const deleteAgentV1WhenUserV1IsDeleted: IBackgroundFunction = (eventData, context, callback) => {
  console.log('Executing function deleteAgentV1WhenUserV1IsDeleted');
  console.log('Event data', JSON.stringify(eventData));
  console.log('Context', JSON.stringify(context));
  (async () => {
    try {
      const configurationManager = new ConfigurationManager();
      await configurationManager.initialize();
      const databaseDriver = configurationManager.getDatabaseDriver();
      const mongoDbAgentsV1DatabaseRepository = new MongoDbAgentsV1DatabaseRepository(databaseDriver);
      const useCase = new DeleteAgentV1FromUserV1DeletedEventUseCase(mongoDbAgentsV1DatabaseRepository);
      await useCase.execute(eventData);
      await databaseDriver.disconnect();
      console.log(`Agent ${eventData.uid} deleted successfully.`);
      callback();
    } catch (error) {
      console.error('deleteAgentV1WhenUserV1IsDeleted error', error);
      callback();
    }
  })();
};
