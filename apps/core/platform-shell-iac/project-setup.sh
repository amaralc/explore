# Run this script: bash apps/core/platform-shell-iac/project-setup.sh

# Define project name
GCP_PROJECT_ID="project-id"

# Define billing account id
GCP_BILLING_ACCOUNT_ID="billing-id"

# Define location
GCP_PROJECT_LOCATION="europe-west3"

# Docker artifact registry repository name
GCP_DOCKER_ARTIFACT_REPOSITORY_NAME="docker-repository"

# Service account name
GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME="terraform-admin"

# Set SERVICE_ACCOUNT_EMAIL
GCP_SERVICE_ACCOUNT_EMAIL="$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

# Define terraform bucket name
GCP_TERRAFORM_STATE_BUCKET_NAME="$GCP_PROJECT_ID-tfstate"

# BASIC GCP SETUP

# Authenticate with Google Cloud
gcloud auth login

# Create project
gcloud projects create $GCP_PROJECT_ID

# Set project as default
gcloud config set project $GCP_PROJECT_ID

# Enable billing
gcloud beta billing projects link $GCP_PROJECT_ID --billing-account=$GCP_BILLING_ACCOUNT_ID

# Create a service account
gcloud iam service-accounts create $GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME --description="Terraform Admin" --display-name=$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME

# Assign roles to the service account
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/servicemanagement.admin"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/editor"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/servicenetworking.networksAdmin" # Create and manage connections
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/resourcemanager.projectIamAdmin" # Create and manage iam policies
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/secretmanager.admin"             # Create and manage iam policies

# Create a key for the service account
gcloud iam service-accounts keys create ./key.json --iam-account $GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com

# Enable APIs
gcloud services enable cloudresourcemanager.googleapis.com --project $GCP_PROJECT_ID

# Create a bucket
gsutil mb -p $GCP_PROJECT_ID -l $GCP_PROJECT_LOCATION gs://$GCP_TERRAFORM_STATE_BUCKET_NAME
