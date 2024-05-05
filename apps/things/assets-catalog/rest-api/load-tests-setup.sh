# Setup env
cp apps/things/assets-catalog/rest-api/.env.example dist/apps/things/assets-catalog/rest-api/.env

echo "" >> dist/apps/things/assets-catalog/rest-api/.env
echo "" >> dist/apps/things/assets-catalog/rest-api/.env

echo "# Use mongodb docker host" >> dist/apps/things/assets-catalog/rest-api/.env
echo "MONGODB_DATABASE_URI=mongodb://local-root-user:local-root-password@mongodb:27017?retryWrites=true&w=majority" >> dist/apps/things/assets-catalog/rest-api/.env
echo "DATABASE_SEED=false" >> dist/apps/things/assets-catalog/rest-api/.env

# Cleanup database
docker compose down mongodb -v

# Setup
docker compose up mongodb things-assets-catalog-rest-api -d
docker compose logs --tail=50 --follow things-assets-catalog-rest-api