# Run this script: bash apps/core/platform-shell-iac/project-setup.sh

# Define project name
GCP_PROJECT_ID="core-platform-shell-iac"

# Define billing account id
GCP_BILLING_ACCOUNT_ID="01BF0C-B0879C-D976FE"

# Define location
GCP_PROJECT_LOCATION="europe-west3"

# Service account name
GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME="terraform-admin"

# Docker artifact registry repository name
GCP_DOCKER_ARTIFACT_REPOSITORY_NAME="docker-repository"

# Set SERVICE_ACCOUNT_EMAIL
GCP_SERVICE_ACCOUNT_EMAIL="$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

# Define terraform bucket name
GCP_TERRAFORM_STATE_BUCKET_NAME="$GCP_PROJECT_ID-tfstate"

# BASIC GCP SETUP

# # Authenticate with Google Cloud
# gcloud auth login

# # Create project
# gcloud projects create $GCP_PROJECT_ID

# Set project as default
gcloud config set project $GCP_PROJECT_ID

# # Enable billing
# gcloud beta billing projects link $GCP_PROJECT_ID --billing-account=$GCP_BILLING_ACCOUNT_ID

# # Enable necessary APIs
# gcloud services enable cloudresourcemanager.googleapis.com --project $GCP_PROJECT_ID
# gcloud services enable artifactregistry.googleapis.com --project $GCP_PROJECT_ID

# # Create a bucket
# gsutil mb -p $GCP_PROJECT_ID -l $GCP_PROJECT_LOCATION gs://$GCP_TERRAFORM_STATE_BUCKET_NAME

# # Create artifact registry repository
# gcloud artifacts repositories create $GCP_DOCKER_ARTIFACT_REPOSITORY_NAME --location=$GCP_PROJECT_LOCATION  --repository-format=docker --description="Docker Repository"

# Create a service account
# gcloud iam service-accounts create $GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME --description="Terraform Admin" --display-name=$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME

# # Create a key for the service account
# gcloud iam service-accounts keys create ./apps/core/platform-shell-iac/credentials.json --iam-account $GCP_SERVICE_ACCOUNT_EMAIL

# # Assign roles to the service account
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/serviceusage.serviceUsageAdmin" # Necessary to list usage of APIs
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/resourcemanager.projectIamAdmin" # Necessary to enable APIs
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/artifactregistry.admin" # Necessary to create repositories
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/servicemanagement.admin" # Necessary to enable APIs
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/storage.admin" # Necessary to access and write to buckets
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/servicenetworking.networksAdmin" # Create and manage connections
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/secretmanager.admin"             # Create and manage iam policies
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountAdmin"
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/run.admin"
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountUser"
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountKeyAdmin"
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.securityAdmin"
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/cloudsql.admin"
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/compute.networkAdmin"
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/vpcaccess.admin"
