# Run this script: bash teams/core/platform-shell-iac/project-setup.sh

# This script accepts named arguments and push an image to container registry

# Expected named arguments:
# --owner-account-email
# --gcp-organization-id
# --gcp-project-id
# --gcp-billing-account-id
# --domain-name
# --github-username
# --github-repository
# --neon-api-key
# --neon-project-location
# --mongodb-atlas-org-id
# --mongodb-atlas-public-key
# --mongodb-atlas-private-key
# --mongodb-atlas-group-id

# Call this script with the following command: bash teams/core/platform-shell-iac/project-setup.sh --owner-account-email=$OWNER_ACCOUNT_EMAIL --gcp-organization-id=$GCP_ORGANIZATION_ID --gcp-project-id=$GCP_PROJECT_ID --gcp-billing-account-id=$GCP_BILLING_ACCOUNT_ID --domain-name=$DOMAIN_NAME --github-username=$GITHUB_USERNAME --github-repository=$GITHUB_REPOSITORY
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
    --neon-api-key=*)
    NEON_API_KEY="${i#*=}"
    shift
    ;;
    --neon-project-location=*)
    NEON_PROJECT_LOCATION="${i#*=}"
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

if [ -z "$NEON_API_KEY" ]
then
    echo "Error: --neon-api-key flag is required"
    exit 1
fi

if [ -z "$NEON_PROJECT_LOCATION" ]
then
    echo "Error: --neon-project-location flag is required"
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

# Workload Identity Pool and Provider names for GitHub Actions OIDC
GCP_WIF_POOL_NAME="github-pool"
GCP_WIF_PROVIDER_NAME="github-provider"

# Environment tag for project classification
GCP_TAG_KEY_SHORT_NAME="environment"
GCP_TAG_VALUE_SHORT_NAME="production"

########## 1. BASIC GOOGLE CLOUD PLATFORM SETUP
echo "Setting up Google Cloud Platform shell project..."
echo ""

# Create environment tag key at the organization level (skip if it already exists)
if gcloud resource-manager tags keys describe "$GCP_ORGANIZATION_ID/$GCP_TAG_KEY_SHORT_NAME" &>/dev/null; then
  echo "Tag key '$GCP_TAG_KEY_SHORT_NAME' already exists, skipping creation."
else
  gcloud resource-manager tags keys create "$GCP_TAG_KEY_SHORT_NAME" \
    --parent="organizations/$GCP_ORGANIZATION_ID" \
    --description="Environment classification for projects"
fi

# Create 'production' tag value under the environment key (skip if it already exists)
if gcloud resource-manager tags values describe "$GCP_ORGANIZATION_ID/$GCP_TAG_KEY_SHORT_NAME/$GCP_TAG_VALUE_SHORT_NAME" &>/dev/null; then
  echo "Tag value '$GCP_TAG_VALUE_SHORT_NAME' already exists, skipping creation."
else
  gcloud resource-manager tags values create "$GCP_TAG_VALUE_SHORT_NAME" \
    --parent="$GCP_ORGANIZATION_ID/$GCP_TAG_KEY_SHORT_NAME" \
    --description="Production environment"
fi

# Create project (skip if it already exists)
if gcloud projects describe $GCP_PROJECT_ID &>/dev/null; then
  echo "Project $GCP_PROJECT_ID already exists, skipping creation."
else
  gcloud projects create $GCP_PROJECT_ID
fi

# Get the project number (needed for tag binding and WIF principal)
GCP_PROJECT_NUMBER=$(gcloud projects describe $GCP_PROJECT_ID --format='value(projectNumber)')

# Bind the Production environment tag to the project (skip if already bound)
if gcloud resource-manager tags bindings create \
  --tag-value="$GCP_ORGANIZATION_ID/$GCP_TAG_KEY_SHORT_NAME/$GCP_TAG_VALUE_SHORT_NAME" \
  --parent="//cloudresourcemanager.googleapis.com/projects/$GCP_PROJECT_NUMBER"; then
  echo "Bound '$GCP_TAG_VALUE_SHORT_NAME' tag to project $GCP_PROJECT_ID."
else
  echo "Warning: Failed to bind '$GCP_TAG_VALUE_SHORT_NAME' tag to project $GCP_PROJECT_ID."
fi

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

# Create a bucket (skip if it already exists)
if gsutil ls -b gs://$GCP_TERRAFORM_STATE_BUCKET_NAME &>/dev/null; then
  echo "Bucket gs://$GCP_TERRAFORM_STATE_BUCKET_NAME already exists, skipping creation."
else
  gsutil mb -p $GCP_PROJECT_ID -l $GCP_PROJECT_LOCATION gs://$GCP_TERRAFORM_STATE_BUCKET_NAME
fi

# Create a service account (skip if it already exists)
if gcloud iam service-accounts describe $GCP_SERVICE_ACCOUNT_EMAIL --project=$GCP_PROJECT_ID &>/dev/null; then
  echo "Service account $GCP_SERVICE_ACCOUNT_EMAIL already exists, skipping creation."
else
  gcloud iam service-accounts create $GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME --description="Terraform Admin" --display-name=$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME
fi

# Enable APIs required for Workload Identity Federation
gcloud services enable iam.googleapis.com --project $GCP_PROJECT_ID
gcloud services enable sts.googleapis.com --project $GCP_PROJECT_ID

# Create Workload Identity Pool for GitHub Actions (skip if it already exists, roles/iam.workloadIdentityPoolAdmin required to owner account)
if gcloud iam workload-identity-pools describe "$GCP_WIF_POOL_NAME" --project="$GCP_PROJECT_ID" --location="global" &>/dev/null; then
  echo "Workload Identity Pool '$GCP_WIF_POOL_NAME' already exists, skipping creation."
else
  gcloud iam workload-identity-pools create "$GCP_WIF_POOL_NAME" \
    --project="$GCP_PROJECT_ID" \
    --location="global" \
    --display-name="GitHub Actions Pool"
fi

# Create OIDC Provider for GitHub within the pool (skip if it already exists)
# Attribute condition restricts to main branch and stable semver release tags only (peerlab@X.Y.Z)
if gcloud iam workload-identity-pools providers describe "$GCP_WIF_PROVIDER_NAME" --project="$GCP_PROJECT_ID" --location="global" --workload-identity-pool="$GCP_WIF_POOL_NAME" &>/dev/null; then
  echo "WIF Provider '$GCP_WIF_PROVIDER_NAME' already exists, skipping creation."
else
  gcloud iam workload-identity-pools providers create-oidc "$GCP_WIF_PROVIDER_NAME" \
    --project="$GCP_PROJECT_ID" \
    --location="global" \
    --workload-identity-pool="$GCP_WIF_POOL_NAME" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
    --attribute-condition="assertion.repository=='$GITHUB_USERNAME/$GITHUB_REPOSITORY' && (assertion.ref=='refs/heads/main' || assertion.ref.matches('refs/tags/peerlab@[0-9]+\\\\.[0-9]+\\\\.[0-9]+\$'))" \
    --issuer-uri="https://token.actions.githubusercontent.com"
fi

# Allow the service account to be impersonated via the WIF pool
gcloud iam service-accounts add-iam-policy-binding "$GCP_SERVICE_ACCOUNT_EMAIL" \
  --project="$GCP_PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$GCP_PROJECT_NUMBER/locations/global/workloadIdentityPools/$GCP_WIF_POOL_NAME/attribute.repository/$GITHUB_USERNAME/$GITHUB_REPOSITORY" > /dev/null
echo "Granted roles/iam.workloadIdentityUser."

# Build the full WIF provider resource name for GitHub Actions
GCP_WORKLOAD_IDENTITY_PROVIDER="projects/$GCP_PROJECT_NUMBER/locations/global/workloadIdentityPools/$GCP_WIF_POOL_NAME/providers/$GCP_WIF_PROVIDER_NAME"

# Assign roles to the service account
echo "Assigning IAM roles to service account..."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/serviceusage.serviceUsageAdmin" > /dev/null # Necessary to list usage of APIs
echo "Granted roles/serviceusage.serviceUsageAdmin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/resourcemanager.projectIamAdmin" > /dev/null # Necessary to enable APIs
echo "Granted roles/resourcemanager.projectIamAdmin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/artifactregistry.admin" > /dev/null # Necessary to create repositories
echo "Granted roles/artifactregistry.admin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/servicemanagement.admin" > /dev/null # Necessary to enable APIs
echo "Granted roles/servicemanagement.admin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/storage.admin" > /dev/null # Necessary to access and write to buckets
echo "Granted roles/storage.admin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/servicenetworking.networksAdmin" > /dev/null # Create and manage connections
echo "Granted roles/servicenetworking.networksAdmin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/secretmanager.admin" > /dev/null # Create and manage iam policies
echo "Granted roles/secretmanager.admin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountAdmin" > /dev/null
echo "Granted roles/iam.serviceAccountAdmin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/run.admin" > /dev/null
echo "Granted roles/run.admin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountUser" > /dev/null
echo "Granted roles/iam.serviceAccountUser."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountKeyAdmin" > /dev/null
echo "Granted roles/iam.serviceAccountKeyAdmin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.securityAdmin" > /dev/null
echo "Granted roles/iam.securityAdmin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/iam.serviceAccountTokenCreator" > /dev/null
echo "Granted roles/iam.serviceAccountTokenCreator."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/cloudsql.admin" > /dev/null
echo "Granted roles/cloudsql.admin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/compute.networkAdmin" > /dev/null
echo "Granted roles/compute.networkAdmin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/vpcaccess.admin" > /dev/null
echo "Granted roles/vpcaccess.admin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/firebase.admin" > /dev/null # Necessary to create firebase project
echo "Granted roles/firebase.admin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/editor" > /dev/null # Necessary to use google_iap_brand and client resources (https://cloud.google.com/iap/docs/programmatic-oauth-clients)
echo "Granted roles/editor."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/source.writer" > /dev/null # Necessary to use google_iap_brand and client resources (https://cloud.google.com/iap/docs/programmatic-oauth-clients)
echo "Granted roles/source.writer."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/source.admin" > /dev/null # Necessary to use google_iap_brand and client resources (https://cloud.google.com/iap/docs/programmatic-oauth-clients)
echo "Granted roles/source.admin."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" --role="roles/dns.admin" > /dev/null # Admin DNS records
echo "Granted roles/dns.admin."

# Create a support group email (skip if it already exists)
# This is necessary when creating a Identity-Aware Proxy (IAP) brand (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/iap_brand)
# Reference: https://cloud.google.com/sdk/gcloud/reference/identity/groups/create
if gcloud identity groups describe $GCP_SUPPORT_GROUP_EMAIL &>/dev/null; then
  echo "Identity group $GCP_SUPPORT_GROUP_EMAIL already exists, skipping creation."
else
  gcloud identity groups create $GCP_SUPPORT_GROUP_EMAIL --organization=$DOMAIN_NAME --display-name="support-team" --description="Support team members will be contacted by end users to clarify doubts and help users get the most out of the platform"
fi
# Memberships are idempotent-safe: add ignores existing members, modify-membership-roles ignores existing roles
gcloud identity groups memberships add --group-email=$GCP_SUPPORT_GROUP_EMAIL --member-email=$GCP_SERVICE_ACCOUNT_EMAIL --roles="MEMBER" 2>/dev/null || true
gcloud identity groups memberships modify-membership-roles --group-email=$GCP_SUPPORT_GROUP_EMAIL --member-email=$GCP_SERVICE_ACCOUNT_EMAIL --add-roles=OWNER 2>/dev/null || true

# Create artifact registry repository (skip if it already exists)
if gcloud artifacts repositories describe $GCP_DOCKER_ARTIFACT_REPOSITORY_NAME --location=$GCP_PROJECT_LOCATION &>/dev/null; then
  echo "Artifact registry repository '$GCP_DOCKER_ARTIFACT_REPOSITORY_NAME' already exists, skipping creation."
else
  gcloud artifacts repositories create $GCP_DOCKER_ARTIFACT_REPOSITORY_NAME --location=$GCP_PROJECT_LOCATION --repository-format=docker --description="Docker Repository"
fi

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
gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER -b"$GCP_WORKLOAD_IDENTITY_PROVIDER"
gh secret set GCP_SERVICE_ACCOUNT_EMAIL -b"$GCP_SERVICE_ACCOUNT_EMAIL"
gh secret set UNLEASH_API_URL -b "unleash-fake-url"
gh secret set UNLEASH_AUTH_TOKEN -b "unleash-fake-token"
gh secret set MONGODB_ATLAS_ORG_ID -b $MONGODB_ATLAS_ORG_ID
gh secret set MONGODB_ATLAS_PUBLIC_KEY -b $MONGODB_ATLAS_PUBLIC_KEY
gh secret set MONGODB_ATLAS_PRIVATE_KEY -b $MONGODB_ATLAS_PRIVATE_KEY
gh secret set NEON_API_KEY -b $NEON_API_KEY
gh secret set NEON_PROJECT_LOCATION -b $NEON_PROJECT_LOCATION

# Optional Nx Cloud setup (in use)
NX_ACCESS_TOKEN="fake-nx-access-token"
gh secret set NX_ACCESS_TOKEN -b $NX_ACCESS_TOKEN

# Optional Sonar Cloud setup (not in use)
# We opted to integrate using "ClickOps" since it was an easy 2 clicks integration between SonarCloud and GitHub for public repositories
# If in the future we wish to integrate programatically, check the docs: https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/

# SONAR_TOKEN="fake-sonar-coud-token"
# gh secret set SONAR_TOKEN -b $SONAR_TOKEN

########## 3. BASIC TERRAFORM SETUP
echo ""
echo "Setting up Terraform..."
echo ""

# Remove .terraform and .terraform.lock.hcl
rm -rf teams/kernel/shell-iac/production/.terraform
rm -rf teams/kernel/shell-iac/production/.terraform.lock.hcl

# Create a default backend.tf
cat > teams/kernel/shell-iac/production/backend.tf <<EOF
# This block sets up what backend should be used for Terraform. In this case, we are using Google Cloud Storage.
terraform {
  backend "gcs" {                                # The Google Cloud Storage backend
    bucket = "$GCP_PROJECT_ID-tfstate"           # The name of the bucket to store the state file
    prefix = "production"                        # The path to the state file within the bucket
    # Authentication uses Application Default Credentials (ADC) from Workload Identity Federation
  }
}
EOF
