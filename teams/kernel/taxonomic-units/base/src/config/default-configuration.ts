import "dotenv/config"

export const defaultConfiguration = {
  server: {
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
  },
  database: {
    uri: process.env.MONGODB_DATABASE_URI,
    name: process.env.MONGODB_DATABASE_NAME,
    provider: process.env.DATABASE_PROVIDER,
    seed: process.env.DATABASE_SEED,
  },
  externalServices: {
    multiInstitutionsV1BaseUrl: process.env.MULTI_INSTITUTIONS_V1_BASE_URL, // External source
    multiCentralsV1BaseUrl: process.env.MULTI_CENTRALS_V1_BASE_URL, // External source
  },
};
