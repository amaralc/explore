#!/bin/bash

# Setup environment variables
cp apps/things/assets-catalog/rest-api/.env.example apps/things/assets-catalog/rest-api/.env
cp apps/kernel/taxonomic-units/rest-api/.env.example apps/kernel/taxonomic-units/rest-api/.env
cp apps/people/organizations-management/rest-api/.env.example apps/people/organizations-management/rest-api/.env

echo "Building app..."
pnpm nx run-many --target=build --all --skip-nx-cache

echo "Copying .env.example..."
cp apps/things/assets-catalog/rest-api/.env.example dist/apps/things/assets-catalog/rest-api/.env