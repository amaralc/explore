npx prisma migrate deploy --schema libs/researchers/peers/adapters/src/database/infra/prisma/postgresql.schema.prisma
node dist/apps/researchers/peers/svc/rest-api/main.js
