#!/bin/bash

# This script accepts named arguments and push an image to container registry

# Expected named arguments:
# --project-id
# --gcp-credentials-path

# Call this script with the following command: bash ./scripts/gcloud/container-registry-push-image.sh --project-id=PROJECT_ID --gcp-credentials-path=GCP_CREDENTIALS_PATH
# Obs.: this script assumes that the service account has already authenticated with gcloud CLI and set the default project with gcloud config set project PROJECT_ID

# Parse command line arguments
# The loop iterates over all arguments
# For each argument, it checks if it matches one of the expected argument formats (--project-id=*, --gcp-credentials-path=*)
# If an argument matches, it removes the prefix (e.g., --project-id=) and assigns the rest of the argument to a variable

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --project-id=*)                 # This starts a new case statement pattern.
    PROJECT_ID="${i#*=}"            # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--project-id=". The ${i#*=} syntax removes the prefix "--project-id=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
    --gcp-credentials-path=*)
    GCP_CREDENTIALS_PATH="${i#*=}"
    shift
    ;;
esac                                # This ends the case statement.
done                                # This ends the loop block.

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]
then
    echo "Error: --project-id flag is required"
    exit 1
fi

# Check if GCP_CREDENTIALS_PATH is set
if [ -z "$GCP_CREDENTIALS_PATH" ]
then
    echo "Error: --gcp-credentials-path flag is required"
    exit 1
fi

# Authenticate to Google Cloud with the service account
gcloud auth activate-service-account --key-file=${GCP_CREDENTIALS_PATH}

# Configure Docker to use gcloud as a credential helper for GCR
gcloud auth configure-docker

# Push the Docker image to GCR
docker push gcr.io/${PROJECT_ID}/researchers-peers-svc:latest
