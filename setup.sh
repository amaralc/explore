echo "Building app..."
pnpm install
pnpm nx run-many --target=build --all --skip-nx-cache

echo "Copying .env.example..."
cp apps/things/assets-catalog/rest-api/.env.example dist/apps/things/assets-catalog/rest-api/.env

docker compose -f ./docker-compose.yml up

# sleep 5
# # Reference: https://dynamox.atlassian.net/wiki/spaces/DYX/pages/955187256/Testes+de+Carga
# K6_WEB_DASHBOARD=true k6 run standard-load.js