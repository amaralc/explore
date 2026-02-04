#!/usr/bin/env bash
set -euo pipefail

PROFILE="peerlab-iam"

echo "=== Tearing down PeerLab IAM local environment ==="
echo "Deleting minikube profile: ${PROFILE}"

minikube delete --profile "${PROFILE}"

echo "Done."
