#!/bin/bash

# Variables
PROJECT_ID=$1
SERVICE_ACCOUNT_NAME=$2
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# This script assigns necessary roles to a service account for managing GCP resources with Terraform

# Assign the Secret Manager Secret Accessor role
# This role allows the service account to access secrets in Secret Manager
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/secretmanager.secretAccessor"

# Assign the IAM Service Account User role
# This role allows the service account to act as other service accounts
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountUser"

# Assign the Cloud Run Admin role
# This role allows the service account to administer Cloud Run services
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/run.admin"

# Assign the Cloud Run Invoker role
# This role allows the service account to invoke Cloud Run services
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/run.invoker"

# Assign the Storage Admin role
# This role allows the service account to administer Cloud Storage resources
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/storage.admin"

# Assign the Service Account Key Admin role
# This role allows the service account to create and manage service account keys
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountKeyAdmin"

# Assign the IAM Role Admin role
# This role allows the service account to create and manage IAM roles
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/iam.roleAdmin"
