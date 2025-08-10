#!/bin/bash

echo "Prepare husky..."
pnpm husky install

echo "Setup environment variables..."
cp teams/things/assets-catalog/rest-api/.env.example teams/things/assets-catalog/rest-api/.env
cp teams/kernel/taxonomic-units/rest-api/.env.example teams/kernel/taxonomic-units/rest-api/.env
cp teams/people/organizations-management/rest-api/.env.example teams/people/organizations-management/rest-api/.env

echo "Generating database clients..."
pnpm prisma generate --schema libs/researchers/peers/adapters/src/database/infra/prisma/postgresql.schema.prisma

echo "Building app..."
pnpm nx run-many --target=build --all --skip-nx-cache

echo "Copying .env.example..."
cp teams/things/assets-catalog/rest-api/.env.example dist/teams/things/assets-catalog/rest-api/.env
cp .env.example .env

echo "Creating log file..."
touch explore.log

# docker compose -f ./docker-compose.yml up -d

# sleep 5
# # Reference: https://dynamox.atlassian.net/wiki/spaces/DYX/pages/955187256/Testes+de+Carga
# K6_WEB_DASHBOARD=true k6 run standard-load.js