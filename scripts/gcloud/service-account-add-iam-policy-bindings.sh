#!/bin/bash

# This script accepts named arguments and assigns necessary roles to a service account for managing GCP resources with Terraform

# Expected named arguments:
# --project-id
# --service-account-name

# Call this script with the following command: bash ./scripts/gcloud/service-account-add-iam-policy-bindings.sh --project-id=PROJECT_ID --service-account-name=SERVICE_ACCOUNT_NAME
# Obs.: this script assumes that the user has already authenticated with gcloud CLI and set the default project with gcloud config set project PROJECT_ID

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

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]
then
    echo "Error: --project-id flag is required"
    exit 1
fi

# Check if SERVICE_ACCOUNT_NAME is set
if [ -z "$SERVICE_ACCOUNT_NAME" ]
then
    echo "Error: --service-account-name flag is required"
    exit 1
fi

# Set SERVICE_ACCOUNT_EMAIL
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# CLI commands

# Assign the Cloud Run Admin role
# This role allows the service account to create and manage Cloud Run services
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/run.admin"

# # Assign the Compute Admin role
# # This role allows the service account to create and manage compute resources
# gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/compute.admin"

# # Assign the Project IAM Admin role
# # This role allows the service account to manage IAM policies of the project
# gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/resourcemanager.projectIamAdmin"

# # Assign the Pub/Sub Subscriber role
# # This role allows the service account to subscribe to Pub/Sub topics
# gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/pubsub.subscriber"

# Assign the Secret Manager Admin role
# This role allows the service account to manage secret resources
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/secretmanager.admin"

# # Assign the Security Admin role
# # This role allows the service account to manage security settings
# gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/iam.securityAdmin"

# Assign the Service Account Admin role
# This role allows the service account to create and manage service accounts
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountAdmin"

# Assign the Service Account Key Admin role
# This role allows the service account to manage service account keys
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountKeyAdmin"

# Assign the Service Account User role
# This role allows the service account to act as other service accounts
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountUser"

# # Assign the Service Networking Admin role
# # This role allows the service account to manage service networking settings
# gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/servicenetworking.networksAdmin"

# Assign the Storage Admin role
# This role allows the service account to manage storage resources
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/storage.admin"

# # Assign the Storage Object Admin role
# # This role allows the service account to manage storage objects
# gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/storage.objectAdmin"
