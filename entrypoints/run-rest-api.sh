npx prisma migrate deploy --schema libs/adapters/src/database/infra/prisma/postgresql.schema.prisma
node dist/apps/service-rest-api/main.js
