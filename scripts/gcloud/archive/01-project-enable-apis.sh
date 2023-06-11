#!/bin/bash

# This script accepts named arguments and assigns necessary roles to a service account for managing GCP resources with Terraform

# Expected named arguments:
# --project-id

# Call this script with the following command: bash ./scripts/gcloud/01-project-enable-apis.sh --project-id=PROJECT_ID
# Obs.: this script assumes that the user has already authenticated with gcloud CLI and set the default project with gcloud config set project PROJECT_ID

# Parse command line arguments
# The loop iterates over all arguments
# For each argument, it checks if it matches one of the expected argument formats (--project-id=*)
# If an argument matches, it removes the prefix (e.g., --project-id=) and assigns the rest of the argument to a variable

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --project-id=*)                 # This starts a new case statement pattern.
    PROJECT_ID="${i#*=}"            # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--project-id=". The ${i#*=} syntax removes the prefix "--project-id=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
esac                                # This ends the case statement.
done                                # This ends the loop block.

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]
then
    echo "Error: --project-id flag is required"
    exit 1
fi

# Enable IAM API
gcloud services enable iam.googleapis.com --project $PROJECT_ID

# Enable Container Registry API
# gcloud services enable containerregistry.googleapis.com --project $PROJECT_ID # This is not necessary since we will use artifact registry instead

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com --project $PROJECT_ID

# Enable Cloud Run API
gcloud services enable run.googleapis.com --project $PROJECT_ID

# Enable Artifact Registry API
gcloud services enable artifactregistry.googleapis.com --project $PROJECT_ID
