#!/bin/bash

# Creating a storage bucket with versioning enabled

# 1. Set the environment variables
# 2. Call this script with the following command: bash ./scripts/gcloud/google-storage-create-bucket.sh

PROJECT_ID="my-project-id"
REGION="my-project-region" # https://cloud.google.com/storage/docs/locations

gsutil mb -l ${REGION} gs://${PROJECT_ID}-tfstate

# References: https://cloud.google.com/storage/docs/creating-buckets
