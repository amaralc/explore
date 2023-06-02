#!/bin/bash

# How to call this script: bash ./file/path/filename.sh

SERVICE_ACCOUNT_NAME="my-service-account"
DESCRIPTION="my-service-account-description"
DISPLAY_NAME="my-service-account-display-name"
PROJECT_ID="my-project-id"

# gcloud iam service-accounts create [SERVICE_ACCOUNT_NAME] --description="[DESCRIPTION]" --display-name="[DISPLAY_NAME]" --project=[PROJECT_ID]
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME --description="$DESCRIPTION" --display-name="$DISPLAY_NAME" --project=$PROJECT_ID
