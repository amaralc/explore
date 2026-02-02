#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
K8S_DIR="${SCRIPT_DIR}/../k8s"
PROFILE="peerlab-iam"

echo "=== PeerLab IAM - Local Development Setup ==="
echo "Using minikube profile: ${PROFILE}"

# Generate random credentials for the local PostgreSQL instance
PG_USERNAME="pguser_$(openssl rand -hex 4)"
PG_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"

# 1. Create minikube cluster
echo ""
echo "[1/4] Creating minikube cluster..."
minikube start --profile "${PROFILE}" --driver=docker --memory=4096 --cpus=2 2>/dev/null || \
  echo "Cluster already exists, continuing..."

# Enable ingress addon for local access
minikube addons enable ingress --profile "${PROFILE}"

# 2. Deploy local PostgreSQL for Logto
echo ""
echo "[2/4] Deploying PostgreSQL for Logto (PG 17)..."
kubectl create namespace logto --context="${PROFILE}" --dry-run=client -o yaml | \
  kubectl apply -f - --context="${PROFILE}"
kubectl create secret generic postgresql-credentials \
  --namespace logto \
  --from-literal=POSTGRES_USER="${PG_USERNAME}" \
  --from-literal=POSTGRES_PASSWORD="${PG_PASSWORD}" \
  --dry-run=client -o yaml | kubectl apply -f - --context="${PROFILE}"
kubectl apply -f "${SCRIPT_DIR}/local-postgresql-logto.yaml" --context="${PROFILE}"
kubectl rollout status statefulset/postgresql -n logto \
  --timeout=300s --context="${PROFILE}"

# 3. Create Logto secrets and deploy
echo ""
echo "[3/4] Deploying Logto..."
kubectl create secret generic logto-db-credentials \
  --namespace logto \
  --from-literal=DB_URL="postgres://${PG_USERNAME}:${PG_PASSWORD}@postgresql.logto.svc.cluster.local:5432/logto" \
  --dry-run=client -o yaml | kubectl apply -f - --context="${PROFILE}"

kubectl apply -f "${K8S_DIR}/logto/configmap.yaml" --context="${PROFILE}"
kubectl apply -f "${K8S_DIR}/logto/deployment.yaml" --context="${PROFILE}"
kubectl apply -f "${K8S_DIR}/logto/service.yaml" --context="${PROFILE}"

# 4. Print access information
echo ""
echo "[4/4] Setup complete!"
echo ""
echo "=== Access Information ==="
echo ""
echo "Logto App:      minikube service logto -n logto --url --profile ${PROFILE}"
echo "Logto Admin:    (port 3002 on the same service)"
echo ""
echo "To open Logto:   minikube service logto -n logto --profile ${PROFILE}"
echo ""
echo "To check pod status:"
echo "  kubectl get pods -A --context=${PROFILE}"
echo ""
echo "To tear down:"
echo "  bash ${SCRIPT_DIR}/teardown-local.sh"
