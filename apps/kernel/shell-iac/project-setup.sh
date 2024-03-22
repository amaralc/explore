# Run this script: bash apps/core/platform-shell-iac/project-setup.sh

# This script accepts named arguments and push an image to container registry

# Expected named arguments:
# --owner-account-email
# --gcp-organization-id
# --gcp-project-id
# --gcp-billing-account-id
# --domain-name
# --github-username
# --github-repository
# --mongodb-atlas-org-id
# --mongodb-atlas-public-key
# --mongodb-atlas-private-key
# --mongodb-atlas-group-id

# Call this script with the following command: bash apps/core/platform-shell-iac/project-setup.sh --owner-account-email=$OWNER_ACCOUNT_EMAIL --gcp-organization-id=$GCP_ORGANIZATION_ID --gcp-project-id=$GCP_PROJECT_ID --gcp-billing-account-id=$GCP_BILLING_ACCOUNT_ID --domain-name=$DOMAIN_NAME --github-username=$GITHUB_USERNAME --github-repository=$GITHUB_REPOSITORY
# Obs.: this script assumes that you are already authenticated with gcloud CLI.

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --owner-account-email=*)
    OWNER_ACCOUNT_EMAIL="${i#*=}"
    shift
    ;;
    --gcp-organization-id=*)
    GCP_ORGANIZATION_ID="${i#*=}"
    shift
    ;;
    --gcp-project-id=*)             # This starts a new case statement pattern.
    GCP_PROJECT_ID="${i#*=}"        # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--gcp-project-id=". The ${i#*=} syntax removes the prefix "--gcp-project-id=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
    --gcp-billing-account-id=*)
    GCP_BILLING_ACCOUNT_ID="${i#*=}"
    shift
    ;;
    --domain-name=*)
    DOMAIN_NAME="${i#*=}"
    shift
    ;;
    --github-username=*)
    GITHUB_USERNAME="${i#*=}"
    shift
    ;;
    --github-repository=*)
    GITHUB_REPOSITORY="${i#*=}"
    shift
    ;;
    --mongodb-atlas-org-id=*)
    MONGODB_ATLAS_ORG_ID="${i#*=}"
    shift
    ;;
    --mongodb-atlas-public-key=*)
    MONGODB_ATLAS_PUBLIC_KEY="${i#*=}"
    shift
    ;;
    --mongodb-atlas-private-key=*)
    MONGODB_ATLAS_PRIVATE_KEY="${i#*=}"
    shift
    ;;
esac                                # This ends the case statement.
done                                # This ends the loop block.

# Check if GCP_ORGANIZATION_ID is set
if [ -z "$GCP_ORGANIZATION_ID" ]
then
    echo "Error: --gcp-organization-id flag is required"
    exit 1
fi

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

# Check if DOMAIN_NAME is set
if [ -z "$DOMAIN_NAME" ]
then
    echo "Error: --domain-name flag is required"
    exit 1
fi

# Check if GITHUB_USERNAME is set
if [ -z "$GITHUB_USERNAME" ]
then
    echo "Error: --github-username flag is required"
    exit 1
fi

# Check if GITHUB_REPOSITORY is set
if [ -z "$GITHUB_REPOSITORY" ]
then
    echo "Error: --github-repository flag is required"
    exit 1
fi

# Check if MONGODB_ATLAS_ORG_ID is set
if [ -z "$MONGODB_ATLAS_ORG_ID" ]
then
    echo "Error: --mongodb-atlas-org-id flag is required"
    exit 1
fi

# Check if MONGODB_ATLAS_PUBLIC_KEY is set
if [ -z "$MONGODB_ATLAS_PUBLIC_KEY" ]
then
    echo "Error: --mongodb-atlas-public-key flag is required"
    exit 1
fi

# Check if MONGODB_ATLAS_PRIVATE_KEY is set
if [ -z "$MONGODB_ATLAS_PRIVATE_KEY" ]
then
    echo "Error: --mongodb-atlas-private-key flag is required"
    exit 1
fi

# Define location
GCP_PROJECT_LOCATION="europe-west1" # Apigee analytics and domain mapping are not available in europe-west3.  Supported regions: asia-northeast1,europe-west1,us-central1,us-east1,us-west1,australia-southeast1,europe-west2,asia-south1,asia-east1,asia-southeast1,asia-southeast2,me-west1

# Service account name
GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME="terraform-admin"

# Docker artifact registry repository name
GCP_DOCKER_ARTIFACT_REPOSITORY_NAME="docker-repository"

# Set SERVICE_ACCOUNT_EMAIL
GCP_SERVICE_ACCOUNT_EMAIL="$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

# Define terraform bucket name
GCP_TERRAFORM_STATE_BUCKET_NAME="$GCP_PROJECT_ID-tfstate"

# Define a support group email
GCP_SUPPORT_GROUP_EMAIL="support@$DOMAIN_NAME"

# Define where service account key will be stored
GCP_TF_ADMIN_SERVICE_ACCOUNT_KEY_PATH="./apps/kernel/shell-iac/production/credentials.json"

########## 1. BASIC GOOGLE CLOUD PLATFORM SETUP
echo "Setting up Google Cloud Platform shell project..."
echo ""

# Create project
gcloud projects create $GCP_PROJECT_ID

# Set project as default
gcloud config set project $GCP_PROJECT_ID

# Enable billing
gcloud beta billing projects link $GCP_PROJECT_ID --billing-account=$GCP_BILLING_ACCOUNT_ID

# Enable necessary APIs
gcloud services enable serviceusage.googleapis.com --project $GCP_PROJECT_ID
gcloud services enable cloudresourcemanager.googleapis.com --project $GCP_PROJECT_ID
gcloud services enable artifactregistry.googleapis.com --project $GCP_PROJECT_ID
gcloud services enable cloudbilling.googleapis.com --project $GCP_PROJECT_ID
gcloud services enable apikeys.googleapis.com --project $GCP_PROJECT_ID
gcloud services enable dns.googleapis.com --project $GCP_PROJECT_ID
gcloud services enable cloudidentity.googleapis.com --project $GCP_PROJECT_ID # Necessary to create a support group email
gcloud services enable iamcredentials.googleapis.com --project $GCP_PROJECT_ID

# Label project for Firebase integration (https://firebase.google.com/docs/projects/terraform/get-started)
gcloud alpha projects update $GCP_PROJECT_ID --update-labels firebase=enabled

# Create a bucket
gsutil mb -p $GCP_PROJECT_ID -l $GCP_PROJECT_LOCATION gs://$GCP_TERRAFORM_STATE_BUCKET_NAME

# Create a service account
gcloud iam service-accounts create $GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME --description="Terraform Admin" --display-name=$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME

# Create a key for the service account
gcloud iam service-accounts keys create $GCP_TF_ADMIN_SERVICE_ACCOUNT_KEY_PATH --iam-account $GCP_SERVICE_ACCOUNT_EMAIL

# Assign roles to the service account
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/serviceusage.serviceUsageAdmin" # Necessary to list usage of APIs
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/resourcemanager.projectIamAdmin" # Necessary to enable APIs
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/artifactregistry.admin" # Necessary to create repositories
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/servicemanagement.admin" # Necessary to enable APIs
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/storage.admin" # Necessary to access and write to buckets
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/servicenetworking.networksAdmin" # Create and manage connections
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/secretmanager.admin"             # Create and manage iam policies
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountAdmin"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/run.admin"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountKeyAdmin"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.securityAdmin"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountTokenCreator"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/cloudsql.admin"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/compute.networkAdmin"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/vpcaccess.admin"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/firebase.admin" # Necessary to create firebase project
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/editor" # Necessary to use google_iap_brand and client resources (https://cloud.google.com/iap/docs/programmatic-oauth-clients)
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/source.writer" # Necessary to use google_iap_brand and client resources (https://cloud.google.com/iap/docs/programmatic-oauth-clients)
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/source.admin" # Necessary to use google_iap_brand and client resources (https://cloud.google.com/iap/docs/programmatic-oauth-clients)
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/dns.admin" # Admin DNS records

# Create a support group email. This is necessary when creating a Identity-Aware Proxy (IAP) brand (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/iap_brand)
# Reference: https://cloud.google.com/sdk/gcloud/reference/identity/groups/create
gcloud identity groups create $GCP_SUPPORT_GROUP_EMAIL --organization=$DOMAIN_NAME --display-name="support-team" --description="Support team members will be contacted by end users to clarify doubts and help users get the most out of the platform"
gcloud identity groups memberships add --group-email=$GCP_SUPPORT_GROUP_EMAIL --member-email=$GCP_SERVICE_ACCOUNT_EMAIL --roles="MEMBER"
gcloud identity groups memberships modify-membership-roles --group-email=$GCP_SUPPORT_GROUP_EMAIL --member-email=$GCP_SERVICE_ACCOUNT_EMAIL --add-roles=OWNER

# Create artifact registry repository
gcloud artifacts repositories create $GCP_DOCKER_ARTIFACT_REPOSITORY_NAME --location=$GCP_PROJECT_LOCATION  --repository-format=docker --description="Docker Repository"

########## 2. BASIC GITHUB SETUP
echo ""
echo "Setting up GitHub actions secrets..."
echo ""

# Set default repository
gh repo set-default $GITHUB_USERNAME/$GITHUB_REPOSITORY

# Set GitHub Actions secrets
gh secret set OWNER_ACCOUNT_EMAIL -b$OWNER_ACCOUNT_EMAIL
gh secret set SUPPORT_ACCOUNT_EMAIL -b$GCP_SUPPORT_GROUP_EMAIL
gh secret set DOMAIN_NAME -b$DOMAIN_NAME
gh secret set GCP_ORGANIZATION_ID -b$GCP_ORGANIZATION_ID
gh secret set GCP_PROJECT_ID -b$GCP_PROJECT_ID
gh secret set GCP_BILLING_ACCOUNT_ID -b$GCP_BILLING_ACCOUNT_ID
gh secret set GCP_DOCKER_ARTIFACT_REPOSITORY_NAME -b$GCP_DOCKER_ARTIFACT_REPOSITORY_NAME
gh secret set GCP_LOCATION -b$GCP_PROJECT_LOCATION
gh secret set GCP_TF_ADMIN_SERVICE_ACCOUNT_KEY < $GCP_TF_ADMIN_SERVICE_ACCOUNT_KEY_PATH
gh secret set UNLEASH_API_URL -b "unleash-fake-url"
gh secret set UNLEASH_AUTH_TOKEN -b "unleash-fake-token"
gh secret set MONGODB_ATLAS_ORG_ID -b $MONGODB_ATLAS_ORG_ID
gh secret set MONGODB_ATLAS_PUBLIC_KEY -b $MONGODB_ATLAS_PUBLIC_KEY
gh secret set MONGODB_ATLAS_PRIVATE_KEY -b $MONGODB_ATLAS_PRIVATE_KEY

########## 3. BASIC TERRAFORM SETUP
echo ""
echo "Setting up Terraform..."
echo ""

# Remove .terraform and .terraform.lock.hcl
rm -rf apps/kernel/shell-iac/production/.terraform
rm -rf apps/kernel/shell-iac/production/.terraform.lock.hcl

# Create a default backend.tf
cat > apps/kernel/shell-iac/production/backend.tf <<EOF
# This block sets up what backend should be used for Terraform. In this case, we are using Google Cloud Storage.
terraform {
  backend "gcs" {                                # The Google Cloud Storage backend
    bucket      = "$GCP_PROJECT_ID-tfstate"      # The name of the bucket to store the state file
    credentials = "credentials.json"             # The path to the JSON key file for the Service Account Terraform will use to manage its state
    prefix      = "production"                   # The path to the state file within the bucket
  }
}
EOF
