#!/bin/bash

# Creating a storage bucket with versioning enabled

# 1. Set the environment variables
# 2. Call this script with the following command: bash ./scripts/gcloud/google-storage-enable-versioning.sh

PROJECT_ID="my-project-id"

gsutil versioning set on gs://${PROJECT_ID}-tfstate

# References: https://cloud.google.com/storage/docs/creating-buckets
