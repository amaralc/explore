import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { defaultConfiguration } from '@peerlab/people/organizations-management/base/config/default-configuration';
import { bootstrapApplication } from './app';

const start = async () => {
  // Instantiate configuration manager
  const configurationManager = new ConfigurationManager();

  // If the application is not in production mode, use in memory database
  if (defaultConfiguration.database.provider === 'mongodb-in-memory') {
    const result = await MongoDbMemoryServer.initializeInMemoryDatabase();
    const databaseUri = result.databaseUri;
    configurationManager.setConfig({
      ...configurationManager.getConfig(),
      database: {
        ...configurationManager.getConfig().database,
        uri: databaseUri,
      },
    });
  }

  // Bootstrap application with applied configuration manager
  const { app } = await bootstrapApplication(configurationManager);
  const port = configurationManager.getConfig().server.port;

  // Start the server
  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
  });

  server.on('error', (error) => {
    console.error(error);
    server.close();
  });
};

start();
