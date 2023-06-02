#!/bin/bash

# Creating a storage bucket

# 1. Set the environment variables
# 2. Call this script with the following command: bash ./scripts/gcloud/create-storage-bucket.sh

PROJECT_ID="my-project-id"
REGION="europe-west3"

gsutil mb -l ${REGION} gs://${PROJECT_ID}-tfstate

# References: https://cloud.google.com/storage/docs/creating-buckets
