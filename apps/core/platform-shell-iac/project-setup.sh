# Run this script: bash apps/core/platform-shell-iac/project-setup.sh


# This script accepts named arguments and push an image to container registry

# Expected named arguments:
# --gcp-project-id
# --gcp-billing-account-id

# Call this script with the following command: bash apps/core/platform-shell-iac/project-setup.sh --gcp-project-id=$GCP_PROJECT_ID --gcp-billing-account-id=$GCP_BILLING_ACCOUNT_ID
# Obs.: this script assumes that you are already authenticated with gcloud CLI.

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --gcp-project-id=*)             # This starts a new case statement pattern.
    GCP_PROJECT_ID="${i#*=}"        # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--gcp-project-id=". The ${i#*=} syntax removes the prefix "--gcp-project-id=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
    --gcp-billing-account-id=*)
    GCP_BILLING_ACCOUNT_ID="${i#*=}"
    shift
    ;;
    --domain=*)
    DOMAIN="${i#*=}"
    shift
    ;;
esac                                # This ends the case statement.
done                                # This ends the loop block.

# Check if GCP_PROJECT_ID is set
if [ -z "$GCP_PROJECT_ID" ]
then
    echo "Error: --gcp-project-id flag is required"
    exit 1
fi

# Check if GCP_BILLING_ACCOUNT_ID is set
if [ -z "$GCP_BILLING_ACCOUNT_ID" ]
then
    echo "Error: --gcp-billing-account-id flag is required"
    exit 1
fi

# Check if DOMAIN is set
if [ -z "$DOMAIN" ]
then
    echo "Error: --domain flag is required"
    exit 1
fi

# Define location
GCP_PROJECT_LOCATION="europe-west3" # Apigee analytics are not available in europe-west3.  Supported regions: asia-northeast1,europe-west1,us-central1,us-east1,us-west1,australia-southeast1,europe-west2,asia-south1,asia-east1,asia-southeast1,asia-southeast2,me-west1

# Service account name
GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME="terraform-admin"

# Docker artifact registry repository name
GCP_DOCKER_ARTIFACT_REPOSITORY_NAME="docker-repository"

# Set SERVICE_ACCOUNT_EMAIL
GCP_SERVICE_ACCOUNT_EMAIL="$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

# Define terraform bucket name
GCP_TERRAFORM_STATE_BUCKET_NAME="$GCP_PROJECT_ID-tfstate"

# Define a support group email
GCP_SUPPORT_GROUP_EMAIL="support@$DOMAIN"

# BASIC GCP SETUP

# # Authenticate with Google Cloud
# gcloud auth login

# # Create project
# gcloud projects create $GCP_PROJECT_ID

# # Set project as default
# gcloud config set project $GCP_PROJECT_ID

# # Enable billing
# gcloud beta billing projects link $GCP_PROJECT_ID --billing-account=$GCP_BILLING_ACCOUNT_ID

# # Enable necessary APIs
# gcloud services enable cloudresourcemanager.googleapis.com --project $GCP_PROJECT_ID
# gcloud services enable artifactregistry.googleapis.com --project $GCP_PROJECT_ID
# gcloud services enable serviceusage.googleapis.com --project $GCP_PROJECT_ID

# # Label project for Firebase integration (https://firebase.google.com/docs/projects/terraform/get-started)
# gcloud projects update $GCP_PROJECT_ID --update-labels firebase=enabled

# # Create a bucket
# gsutil mb -p $GCP_PROJECT_ID -l $GCP_PROJECT_LOCATION gs://$GCP_TERRAFORM_STATE_BUCKET_NAME

# # Create artifact registry repository
# gcloud artifacts repositories create $GCP_DOCKER_ARTIFACT_REPOSITORY_NAME --location=$GCP_PROJECT_LOCATION  --repository-format=docker --description="Docker Repository"

# Create a service account
# gcloud iam service-accounts create $GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME --description="Terraform Admin" --display-name=$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME

# MANUAL STEPS

# Adding roles in the organization level cannot yet be accomplished using the gcloud CLI. The following steps must be done manually.

# 1. Add Project Creator role to service account
# - Access https://console.cloud.google.com/cloud-resource-manager
# - Follow steps documented in https://cloud.google.com/resource-manager/docs/default-access-control
# - References: https://registry.terraform.io/modules/terraform-google-modules/project-factory/google/latest#permissions

# 2. Add Billing Account User role to service account
# - References: https://cloud.google.com/billing/docs/how-to/grant-access-to-billing?hl=pt-br

# 3. Add Apigee Oganization Admin role to service account
# - References: https://cloud.google.com/apigee/docs/hybrid/v1.10/precog-provision.html

# AUTOMATIC STEPS

# Create a support group email. This is necessary when creating a Identity-Aware Proxy (IAP) brand (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/iap_brand)
# gcloud identity groups create $GCP_SUPPORT_GROUP_EMAIL --organization=$DOMAIN --description="Support Group"

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
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/firebase.admin" # Necessary to create firebase project
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/editor" # Necessary to use google_iap_brand and client resources (https://cloud.google.com/iap/docs/programmatic-oauth-clients)
