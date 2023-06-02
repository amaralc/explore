#!/bin/bash

# Creating a service account

# 1. Set the environment variables
# 2. Call this script with the following command: bash ./scripts/gcloud/create-service-account.sh

SERVICE_ACCOUNT_NAME="my-service-account"
DESCRIPTION="my-service-account-description"
DISPLAY_NAME="my-service-account-display-name"
PROJECT_ID="my-project-id"

gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME --description="$DESCRIPTION" --display-name="$DISPLAY_NAME" --project=$PROJECT_ID

# References: https://cloud.google.com/iam/docs/creating-managing-service-accounts
