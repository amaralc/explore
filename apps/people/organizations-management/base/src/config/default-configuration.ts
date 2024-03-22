export const defaultConfiguration = {
  server: {
    port: process.env.PORT || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    uri: process.env.MONGODB_DATABASE_URI || 'mongodb://localhost:27017',
    name: process.env.MONGODB_DATABASE_NAME || 'organizations-management',
    provider: process.env.DATABASE_PROVIDER || 'in-memory',
    seed: process.env.DATABASE_SEED || 'false',
  },
};
