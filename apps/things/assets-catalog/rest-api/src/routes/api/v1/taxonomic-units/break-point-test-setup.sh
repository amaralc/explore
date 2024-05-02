# Cleanup database
docker compose down mongodb -v

# Build app
pnpm nx build things-assets-catalog-rest-api --skip-nx-cache
cp apps/things/assets-catalog/rest-api/.env.example dist/apps/things/assets-catalog/rest-api/.env
echo "MONGODB_DATABASE_URI=mongodb://local-root-user:local-root-password@mongodb:27017?retryWrites=true&w=majority" > dist/apps/things/assets-catalog/rest-api/.env

# Setup
docker compose up mongodb things-assets-catalog-rest-api -d
docker compose logs --tail=50 --follow things-assets-catalog-rest-api