# Setup env
cp apps/things/assets-catalog/rest-api/.env.example dist/apps/things/assets-catalog/rest-api/.env

# Cleanup
docker compose down grafana prometheus -v

# Setup Grafana and Prometheus
docker compose up grafana prometheus -d