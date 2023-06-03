#!/bin/bash

# This script accepts named arguments and assigns necessary roles to a service account for managing GCP resources with Terraform

# Expected named arguments:
# --project-id
# --service-account-email

# Parse command line arguments
# The loop iterates over all arguments
# For each argument, it checks if it matches one of the expected argument formats (--project-id=*, --service-account-name=*)
# If an argument matches, it removes the prefix (e.g., --project-id=) and assigns the rest of the argument to a variable

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --project-id=*)                 # This starts a new case statement pattern.
    PROJECT_ID="${i#*=}"            # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--project-id=". The ${i#*=} syntax removes the prefix "--project-id=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
    --service-account-name=*)       # This starts a new case statement pattern.
    SERVICE_ACCOUNT_NAME="${i#*=}"  # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--service-account-name=". The ${i#*=} syntax removes the prefix "--service-account-name=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
esac                                # This ends the case statement.
done                                # This ends the loop block.

SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# CLI commands

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
