import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { NativeLogger } from '@peerlab/kernel/shared-ts-utils/logs/native-logger';
import { ConfigurationManager } from '@peerlab/things/assets-catalog/base/config/configuration-manager';
import { defaultConfiguration } from '@peerlab/things/assets-catalog/base/config/default-configuration';
import { bootstrapApplication } from './app';

const start = async () => {
  // Instantiate configuration manager
  const logger = new NativeLogger();
  const configurationManager = new ConfigurationManager(defaultConfiguration, logger);
  const config = configurationManager.getConfig();

  // If the application is not in production mode, use in memory database
  if (config.database.provider === 'mongodb-in-memory' && config.server.nodeEnv !== 'production') {
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
