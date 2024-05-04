# Setup env
pnpm nx build things-assets-catalog-rest-api
cp apps/things/assets-catalog/rest-api/.env.example dist/apps/things/assets-catalog/rest-api/.env

echo "" >> dist/apps/things/assets-catalog/rest-api/.env
echo "" >> dist/apps/things/assets-catalog/rest-api/.env

echo "# Use mongodb docker host" >> dist/apps/things/assets-catalog/rest-api/.env
echo "MONGODB_DATABASE_URI=mongodb://local-root-user:local-root-password@mongodb:27017?retryWrites=true&w=majority" >> dist/apps/things/assets-catalog/rest-api/.env
echo "DATABASE_SEED=false" >> dist/apps/things/assets-catalog/rest-api/.env

# Cleanup
docker compose down grafana prometheus -v

# Setup Grafana and Prometheus
docker compose up grafana prometheus -d