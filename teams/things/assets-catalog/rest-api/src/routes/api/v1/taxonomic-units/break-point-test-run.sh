# Variables
SHORT_COMMIT_SHA=$(git rev-parse HEAD | cut -c1-8)
CURRENT_TIMESTAMP=$(date --iso-8601=seconds)

# K6_WEB_DASHBOARD=true
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
K6_PROMETHEUS_RW_TREND_STATS="p(95),p(99),min,max" \
k6 run --tag testid="$SHORT_COMMIT_SHA-$CURRENT_TIMESTAMP"  --summary-trend-stats="med,p(95),p(99)" -o experimental-prometheus-rw teams/things/assets-catalog/rest-api/src/routes/api/v1/taxonomic-units/break-point-test.js