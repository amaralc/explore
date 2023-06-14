# Set the path to your service account key file
export GOOGLE_APPLICATION_CREDENTIALS="apps/core/platform-shell-iac/production/credentials.json"

# Authenticate to Google Cloud with the service account
gcloud auth activate-service-account --key-file=${GOOGLE_APPLICATION_CREDENTIALS}

# Configure Docker to use gcloud as a credential helper for GCR
gcloud auth configure-docker
