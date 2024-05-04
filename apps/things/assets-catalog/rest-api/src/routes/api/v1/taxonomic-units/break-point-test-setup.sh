# Cleanup database
docker compose down mongodb -v

# Setup
docker compose up mongodb things-assets-catalog-rest-api -d
docker compose logs --tail=50 --follow things-assets-catalog-rest-api