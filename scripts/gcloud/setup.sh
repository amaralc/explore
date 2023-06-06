# Run this script: bash scripts/gcloud/setup.sh

# Create project
# gcloud projects create my-pl-test-project

# Set project as default
# gcloud config set project my-pl-test-project

# Enable billing
# BILLING_ACCOUNT_ID="billing-account-id"
# gcloud beta billing projects link my-pl-test-project --billing-account=$BILLING_ACCOUNT_ID

# Enable artifact registry api
# gcloud services enable artifactregistry.googleapis.com

# Create artifact registry repository
# gcloud artifacts repositories create my-docker-repo --repository-format=docker --location=europe-west3 --description="Docker repository"

# Create a service account
# gcloud iam service-accounts create my-service-account --description="My service account" --display-name="my-service-account"

# Grant artifact registry permissions to the service account
# gcloud projects add-iam-policy-binding my-pl-test-project --member=serviceAccount:my-service-account@my-pl-test-project.iam.gserviceaccount.com --role=roles/artifactregistry.writer

# Create a key for the service account
# gcloud iam service-accounts keys create ~/key.json --iam-account my-service-account@my-pl-test-project.iam.gserviceaccount.com


