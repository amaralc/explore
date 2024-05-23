import dotenv from 'dotenv';

dotenv.config();

import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { ConfigurationManager } from '@peerlab/things/assets-catalog/base/config/configuration-manager';
import { defaultConfiguration } from '@peerlab/things/assets-catalog/base/config/default-configuration';
import { bootstrapApplication } from './app';

const start = async () => {
  const log: ILogMetadata = {
    scope: {
      moduleName: 'main',
    },
    steps: [],
  };

  // Instantiate configuration manager
  log.steps.push({ message: 'Initializing configuration manager with default configuration...' });
  const configurationManager = new ConfigurationManager(defaultConfiguration);
  const config = configurationManager.getConfig();

  // If the application is not in production mode, use in memory database
  if (config.database.provider === 'mongodb-in-memory' && config.server.nodeEnv !== 'production') {
    log.steps.push({
      message: 'Initializing in memory database...',
      metadata: {
        databaseProvider: config.database.provider,
        nodeEnv: config.server.nodeEnv,
      },
    });
    const result = await MongoDbMemoryServer.initializeInMemoryDatabase();
    const databaseUri = result.databaseUri;

    log.steps.push({ message: 'Overriding database url with in memory url...' });
    configurationManager.setConfig({
      ...configurationManager.getConfig(),
      database: {
        ...configurationManager.getConfig().database,
        uri: databaseUri,
      },
    });
  }

  log.steps.push({ message: 'Bootstraping application with applied configuration manager...' });
  const { app } = await bootstrapApplication(configurationManager);
  const port = configurationManager.getConfig().server.port;

  log.steps.push({ message: 'Starting server...' });
  const server = app.listen(port, () => {
    winstonLogger.info(`Listening at http://localhost:${port}`, log);
    winstonLogger.info('Testing logger', {
      scope: {
        moduleName: 'fake module',
        methodName: 'fakeMethod',
      },
      steps: [{ message: 'fake message' }],
    });
  });

  server.on('error', (error) => {
    log.steps.push({
      message: 'Server error. Closing server...',
      metadata: { errorStack: error.stack },
    });
    winstonLogger.error('Server error. Closing server...', log);
    server.close();
  });
};

start();
