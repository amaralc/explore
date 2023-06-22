# Run this script: bash apps/core/platform-build-iac/project-cleanup.sh

# Define project name
GCP_PROJECT_ID="project-id"

# Define billing account id
GCP_BILLING_ACCOUNT_ID="billing-id"

# Define location
GCP_PROJECT_LOCATION="europe-west3"

# Service account name
GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME="terraform-admin"

# Set SERVICE_ACCOUNT_EMAIL
GCP_SERVICE_ACCOUNT_EMAIL="$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

# Define terraform bucket name
GCP_TERRAFORM_STATE_BUCKET_NAME="$GCP_PROJECT_ID-tfstate"

# BASIC GCP SETUP

# # Create project
# gcloud projects create $GCP_PROJECT_ID

# Set project as default
gcloud config set project $GCP_PROJECT_ID

# Create a service account
gcloud iam service-accounts delete $GCP_SERVICE_ACCOUNT_EMAIL

# Enable APIs
gcloud services disable cloudresourcemanager.googleapis.com --project $GCP_PROJECT_ID

# Create a bucket
gsutil rm -r gs://$GCP_TERRAFORM_STATE_BUCKET_NAME
