#!/bin/sh
set -e

# This script accepts named arguments and sets up a GCP project with mirrored folder hierarchy

# Expected named arguments:
# --owner-account-email
# --gcp-organization-id
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
# --nx-cloud-access-token-read-write
# --nx-cloud-access-token-read
# --gcp-project-id (optional: if not provided, auto-generated from script location)
#
# NOTE: If --gcp-project-id is not provided, it will be auto-generated from script location (e.g., bootstrap-a3f2)

# Call this script with the following command: sh {FOLDER_PATH}/project-setup.sh --owner-account-email=$OWNER_ACCOUNT_EMAIL --gcp-organization-id=$GCP_ORGANIZATION_ID --gcp-billing-account-id=$GCP_BILLING_ACCOUNT_ID --domain-name=$DOMAIN_NAME --github-username=$GITHUB_USERNAME --github-repository=$GITHUB_REPOSITORY --neon-api-key=$NEON_API_KEY --neon-project-location=$NEON_PROJECT_LOCATION --mongodb-atlas-org-id=$MONGODB_ATLAS_ORG_ID --mongodb-atlas-public-key=$MONGODB_ATLAS_PUBLIC_KEY --mongodb-atlas-private-key=$MONGODB_ATLAS_PRIVATE_KEY --nx-cloud-access-token-read-write=$NX_CLOUD_ACCESS_TOKEN_READ_WRITE --nx-cloud-access-token-read=$NX_CLOUD_ACCESS_TOKEN_READ
# Obs.: this script assumes that you are already authenticated with gcloud CLI and GitHub CLI.

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
    --nx-cloud-access-token-read-write=*)
    NX_CLOUD_ACCESS_TOKEN_READ_WRITE="${i#*=}"
    shift
    ;;
    --nx-cloud-access-token-read=*)
    NX_CLOUD_ACCESS_TOKEN_READ="${i#*=}"
    shift
    ;;
    --gcp-project-id=*)
    GCP_PROJECT_ID="${i#*=}"
    shift
    ;;
esac                                # This ends the case statement.
done                                # This ends the loop block.

# ============================================
# PATH DETECTION AND PROJECT ID GENERATION
# ============================================

# Detect script location and calculate relative path
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Get git repository root
if GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null); then
    REPO_ROOT="$GIT_ROOT"
else
    echo "Error: Must be run from within a git repository"
    exit 1
fi

# Check if GCP_ORGANIZATION_ID is set
if [ -z "$GCP_ORGANIZATION_ID" ]
then
    echo "Error: --gcp-organization-id flag is required"
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

if [ -z "$NX_CLOUD_ACCESS_TOKEN_READ_WRITE" ]
then
    echo "Error: --nx-cloud-access_token-read-write flag is required"
    exit 1
fi

if [ -z "$NX_CLOUD_ACCESS_TOKEN_READ" ]
then
    echo "Error: --nx-cloud-access-token-read flag is required"
    exit 1
fi

# Define location
GCP_PROJECT_LOCATION="europe-west1" # Apigee analytics and domain mapping are not available in europe-west3.  Supported regions: asia-northeast1,europe-west1,us-central1,us-east1,us-west1,australia-southeast1,europe-west2,asia-south1,asia-east1,asia-southeast1,asia-southeast2,me-west1

# Service account name
GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME="terraform-admin"

# Docker artifact registry repository name
GCP_DOCKER_ARTIFACT_REPOSITORY_NAME="docker-repository"

# Define a support group email
GCP_SUPPORT_GROUP_EMAIL="support@$DOMAIN_NAME"

# Workload Identity Pool and Provider names for GitHub Actions OIDC
GCP_WIF_POOL_NAME="github-pool"
GCP_WIF_PROVIDER_NAME="github-provider"
GCP_WIF_LOCATION="global"

# Environment tag for project classification
GCP_TAG_KEY_SHORT_NAME="environment"
GCP_TAG_VALUE_SHORT_NAME="production"

# ============================================
# FOLDER HIERARCHY CREATION
# ============================================

# Calculate relative path from repo root
RELATIVE_PATH="${SCRIPT_DIR#$REPO_ROOT/}"

# Validate relative path was calculated
if [ -z "$RELATIVE_PATH" ] || [ "$RELATIVE_PATH" = "$SCRIPT_DIR" ]; then
    echo "Error: Could not determine relative path from repository root"
    echo "  SCRIPT_DIR: $SCRIPT_DIR"
    echo "  REPO_ROOT: $REPO_ROOT"
    exit 1
fi

# Extract basename from path (last component after final /)
PROJECT_BASE_NAME="${RELATIVE_PATH##*/}"

# Extract folder path (everything before the last /)
FOLDER_PATH="${RELATIVE_PATH%/*}"

# Validate that we have both folders and basename
if [ -z "$FOLDER_PATH" ] || [ "$FOLDER_PATH" = "$RELATIVE_PATH" ]; then
    echo "Error: Expected path with both folders and basename (e.g., teams/kernel/iac/bootstrap)"
    echo "  Relative path: $RELATIVE_PATH"
    exit 1
fi

# Parse folder components using POSIX-compatible method
# Convert "teams/kernel/iac" to space-separated words (teams kernel iac)
FOLDER_NAMES=$(echo "$FOLDER_PATH" | tr '/' ' ')

# Validate project base name is not empty
if [ -z "$PROJECT_BASE_NAME" ]; then
    echo "Error: Could not extract project base name from path"
    echo "  Relative path: $RELATIVE_PATH"
    echo "  Folder path: $FOLDER_PATH"
    exit 1
fi

echo "Detected path structure:"
echo "  Folders: $FOLDER_NAMES"
echo "  Project base: $PROJECT_BASE_NAME"
echo ""

# Generate project ID if not provided as parameter
if [ -z "$GCP_PROJECT_ID" ]; then
    GCP_PROJECT_ID=$(sh "$SCRIPT_DIR/generate-project-id.sh" "$PROJECT_BASE_NAME")
    if [ -z "$GCP_PROJECT_ID" ]; then
        echo "Error: Failed to generate project ID"
        exit 1
    fi
    echo "Generated project ID: $GCP_PROJECT_ID"
else
    echo "Using provided project ID: $GCP_PROJECT_ID"
fi
echo ""

# Build folder hierarchy
echo "Creating GCP folder hierarchy..."
CURRENT_PARENT_TYPE="organizations"
CURRENT_PARENT_ID="$GCP_ORGANIZATION_ID"

for folder_name in $FOLDER_NAMES; do
    FOLDER_ID=$(sh "$SCRIPT_DIR/find-or-create-folder.sh" "$folder_name" "$CURRENT_PARENT_TYPE" "$CURRENT_PARENT_ID")
    CURRENT_PARENT_TYPE="folders"
    CURRENT_PARENT_ID="$FOLDER_ID"
done

FINAL_PARENT_FOLDER_ID="$CURRENT_PARENT_ID"
echo "✓ Folder hierarchy complete. Leaf folder ID: $FINAL_PARENT_FOLDER_ID"
echo ""

# ============================================
# PROJECT ID VALIDATION AND DEPENDENT VARS
# ============================================

# Validate that GCP_PROJECT_ID is now set (either from parameter or generated)
if [ -z "$GCP_PROJECT_ID" ]; then
    echo "Error: GCP_PROJECT_ID not set or generated"
    exit 1
fi

# Set SERVICE_ACCOUNT_EMAIL (now that GCP_PROJECT_ID is guaranteed to be set)
GCP_SERVICE_ACCOUNT_EMAIL="$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

# Define terraform bucket name (now that GCP_PROJECT_ID is guaranteed to be set)
GCP_TERRAFORM_STATE_BUCKET_NAME="$GCP_PROJECT_ID-tfstate"

########## 1. SETTING UP GCP PROJECT
echo ""
echo "Setting up GCP project $GCP_PROJECT_ID..."

# Tags
if gcloud resource-manager tags keys describe "$GCP_ORGANIZATION_ID/$GCP_TAG_KEY_SHORT_NAME" &>/dev/null; then
  echo "  ○ Tag key '$GCP_TAG_KEY_SHORT_NAME' already exists"
else
  gcloud resource-manager tags keys create "$GCP_TAG_KEY_SHORT_NAME" \
    --parent="organizations/$GCP_ORGANIZATION_ID" \
    --description="Environment classification for projects" > /dev/null
  echo "  ✓ Tag key '$GCP_TAG_KEY_SHORT_NAME' created"
fi
if gcloud resource-manager tags values describe "$GCP_ORGANIZATION_ID/$GCP_TAG_KEY_SHORT_NAME/$GCP_TAG_VALUE_SHORT_NAME" &>/dev/null; then
  echo "  ○ Tag value '$GCP_TAG_VALUE_SHORT_NAME' already exists"
else
  gcloud resource-manager tags values create "$GCP_TAG_VALUE_SHORT_NAME" \
    --parent="$GCP_ORGANIZATION_ID/$GCP_TAG_KEY_SHORT_NAME" \
    --description="Production environment" > /dev/null
  echo "  ✓ Tag value '$GCP_TAG_VALUE_SHORT_NAME' created"
fi

# Project
if gcloud projects describe $GCP_PROJECT_ID &>/dev/null; then
  echo "  ○ Project $GCP_PROJECT_ID already exists"
else
  gcloud projects create $GCP_PROJECT_ID \
    --folder="$FINAL_PARENT_FOLDER_ID" \
    --name="$GCP_PROJECT_ID" > /dev/null 2>&1
  echo "  ✓ Project $GCP_PROJECT_ID created"
fi
gcloud config set project $GCP_PROJECT_ID > /dev/null

# Project number & tagging
GCP_PROJECT_NUMBER=$(gcloud projects describe $GCP_PROJECT_ID --format='value(projectNumber)')
gcloud resource-manager tags bindings create \
  --tag-value="$GCP_ORGANIZATION_ID/$GCP_TAG_KEY_SHORT_NAME/$GCP_TAG_VALUE_SHORT_NAME" \
  --parent="//cloudresourcemanager.googleapis.com/projects/$GCP_PROJECT_NUMBER" 2>/dev/null || true
echo "  ✓ Project tagged as production"

# Billing
gcloud beta billing projects link $GCP_PROJECT_ID --billing-account=$GCP_BILLING_ACCOUNT_ID > /dev/null 2>&1
echo "  ✓ Billing linked"

# APIs
gcloud services enable \
  serviceusage.googleapis.com \
  cloudresourcemanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbilling.googleapis.com \
  apikeys.googleapis.com \
  dns.googleapis.com \
  cloudidentity.googleapis.com \
  iamcredentials.googleapis.com \
  iam.googleapis.com \
  sts.googleapis.com \
  --project $GCP_PROJECT_ID > /dev/null
echo "  ✓ APIs enabled"

# Labels
gcloud alpha projects update $GCP_PROJECT_ID --update-labels firebase=enabled > /dev/null
echo "  ✓ Firebase label added"

# Storage bucket
if gsutil ls -b gs://$GCP_TERRAFORM_STATE_BUCKET_NAME &>/dev/null; then
  echo "  ○ Terraform state bucket already exists"
else
  gsutil mb -p $GCP_PROJECT_ID -l $GCP_PROJECT_LOCATION gs://$GCP_TERRAFORM_STATE_BUCKET_NAME > /dev/null 2>&1
  echo "  ✓ Terraform state bucket created"
fi

# Service account
if gcloud iam service-accounts describe $GCP_SERVICE_ACCOUNT_EMAIL --project=$GCP_PROJECT_ID &>/dev/null; then
  echo "  ○ Service account $GCP_SERVICE_ACCOUNT_EMAIL already exists"
else
  gcloud iam service-accounts create $GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME \
    --description="Terraform Admin" --display-name=$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME > /dev/null 2>&1
  echo "  ✓ Service account created"
fi

########## 1b. SETTING UP WORKLOAD IDENTITY FEDERATION
echo ""
echo "Setting up Workload Identity Federation..."

# WIF Pool
if gcloud iam workload-identity-pools describe "$GCP_WIF_POOL_NAME" \
  --project="$GCP_PROJECT_ID" --location="$GCP_WIF_LOCATION" &>/dev/null; then
  echo "  ○ WIF pool '$GCP_WIF_POOL_NAME' already exists"
else
  gcloud iam workload-identity-pools create "$GCP_WIF_POOL_NAME" \
    --project="$GCP_PROJECT_ID" \
    --location="$GCP_WIF_LOCATION" \
    --display-name="GitHub Actions Pool" > /dev/null
  echo "  ✓ WIF pool '$GCP_WIF_POOL_NAME' created"
fi

# WIF Provider
if gcloud iam workload-identity-pools providers describe "$GCP_WIF_PROVIDER_NAME" \
  --project="$GCP_PROJECT_ID" --location="$GCP_WIF_LOCATION" \
  --workload-identity-pool="$GCP_WIF_POOL_NAME" &>/dev/null; then
  echo "  ○ GitHub OIDC provider already exists"
else
  gcloud iam workload-identity-pools providers create-oidc "$GCP_WIF_PROVIDER_NAME" \
    --project="$GCP_PROJECT_ID" \
    --location="$GCP_WIF_LOCATION" \
    --workload-identity-pool="$GCP_WIF_POOL_NAME" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
    --attribute-condition="assertion.repository=='$GITHUB_USERNAME/$GITHUB_REPOSITORY' && (assertion.ref=='refs/heads/main' || assertion.ref.matches('refs/tags/peerlab@[0-9]+\\\\.[0-9]+\\\\.[0-9]+\$'))" \
    --issuer-uri="https://token.actions.githubusercontent.com" > /dev/null
  echo "  ✓ GitHub OIDC provider created"
fi

# WIF binding
gcloud iam service-accounts add-iam-policy-binding "$GCP_SERVICE_ACCOUNT_EMAIL" \
  --project="$GCP_PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$GCP_PROJECT_NUMBER/locations/$GCP_WIF_LOCATION/workloadIdentityPools/$GCP_WIF_POOL_NAME/attribute.repository/$GITHUB_USERNAME/$GITHUB_REPOSITORY" > /dev/null 2>&1
echo "  ✓ Service account WIF binding complete"

GCP_WORKLOAD_IDENTITY_PROVIDER="projects/$GCP_PROJECT_NUMBER/locations/$GCP_WIF_LOCATION/workloadIdentityPools/$GCP_WIF_POOL_NAME/providers/$GCP_WIF_PROVIDER_NAME"

########## 1c. GRANTING SERVICE ACCOUNT ROLES
echo ""
echo "Granting service account IAM roles..."

# Project-level roles
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/serviceusage.serviceUsageAdmin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/resourcemanager.projectIamAdmin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/artifactregistry.admin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/servicemanagement.admin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/storage.admin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/servicenetworking.networksAdmin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.admin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.serviceAccountAdmin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/run.admin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.serviceAccountUser" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.serviceAccountKeyAdmin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.securityAdmin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.serviceAccountTokenCreator" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/cloudsql.admin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/compute.networkAdmin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/vpcaccess.admin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/firebase.admin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/editor" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/source.writer" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/source.admin" > /dev/null 2>&1
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/dns.admin" > /dev/null 2>&1
echo "  ✓ Project-level roles granted"

# Organization-level roles
gcloud organizations add-iam-policy-binding "$GCP_ORGANIZATION_ID" \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/resourcemanager.organizationViewer" > /dev/null 2>&1
gcloud organizations add-iam-policy-binding "$GCP_ORGANIZATION_ID" \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/resourcemanager.folderAdmin" > /dev/null 2>&1
gcloud organizations add-iam-policy-binding "$GCP_ORGANIZATION_ID" \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/resourcemanager.projectCreator" > /dev/null 2>&1
gcloud organizations add-iam-policy-binding "$GCP_ORGANIZATION_ID" \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/resourcemanager.folderIamAdmin" > /dev/null 2>&1
gcloud organizations add-iam-policy-binding "$GCP_ORGANIZATION_ID" \
  --member="serviceAccount:$GCP_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/billing.user" > /dev/null 2>&1
echo "  ✓ Organization-level roles granted"

########## 1d. SUPPORT GROUP & ARTIFACT REGISTRY
echo ""
echo "Setting up support infrastructure..."

# Support group
if gcloud identity groups describe $GCP_SUPPORT_GROUP_EMAIL &>/dev/null; then
  echo "  ○ Support group $GCP_SUPPORT_GROUP_EMAIL already exists"
else
  gcloud identity groups create $GCP_SUPPORT_GROUP_EMAIL \
    --organization=$DOMAIN_NAME \
    --display-name="support-team" \
    --description="Support team members will be contacted by end users to clarify doubts and help users get the most out of the platform" > /dev/null 2>&1
  echo "  ✓ Support group created"
fi
gcloud identity groups memberships add --group-email=$GCP_SUPPORT_GROUP_EMAIL --member-email=$GCP_SERVICE_ACCOUNT_EMAIL --roles="MEMBER" > /dev/null 2>&1 || true
gcloud identity groups memberships modify-membership-roles --group-email=$GCP_SUPPORT_GROUP_EMAIL --member-email=$GCP_SERVICE_ACCOUNT_EMAIL --add-roles=OWNER > /dev/null 2>&1 || true

# Docker registry
if gcloud artifacts repositories describe $GCP_DOCKER_ARTIFACT_REPOSITORY_NAME --location=$GCP_PROJECT_LOCATION &>/dev/null; then
  echo "  ○ Docker artifact registry already exists"
else
  gcloud artifacts repositories create $GCP_DOCKER_ARTIFACT_REPOSITORY_NAME \
    --location=$GCP_PROJECT_LOCATION --repository-format=docker \
    --description="Docker Repository" > /dev/null 2>&1
  echo "  ✓ Docker artifact registry created"
fi

########## 2. SETTING UP GITHUB
echo ""
echo "Setting up GitHub repository..."

# Default repo
gh repo set-default $GITHUB_USERNAME/$GITHUB_REPOSITORY > /dev/null
echo "  ✓ Repository configured"

# Environments
gh api repos/$GITHUB_USERNAME/$GITHUB_REPOSITORY/environments/main -X PUT > /dev/null 2>&1
gh api repos/$GITHUB_USERNAME/$GITHUB_REPOSITORY/environments/pr-open -X PUT > /dev/null 2>&1
echo "  ✓ Environments created (main, pr-open)"

# Secrets - main environment
gh secret set OWNER_ACCOUNT_EMAIL --env main -b"$OWNER_ACCOUNT_EMAIL" > /dev/null 2>&1
gh secret set SUPPORT_ACCOUNT_EMAIL --env main -b"$GCP_SUPPORT_GROUP_EMAIL" > /dev/null 2>&1
gh secret set DOMAIN_NAME --env main -b"$DOMAIN_NAME" > /dev/null 2>&1
gh secret set GCP_ORGANIZATION_ID --env main -b"$GCP_ORGANIZATION_ID" > /dev/null 2>&1
gh secret set GCP_PROJECT_ID --env main -b"$GCP_PROJECT_ID" > /dev/null 2>&1
gh secret set GCP_BILLING_ACCOUNT_ID --env main -b"$GCP_BILLING_ACCOUNT_ID" > /dev/null 2>&1
gh secret set GCP_DOCKER_ARTIFACT_REPOSITORY_NAME --env main -b"$GCP_DOCKER_ARTIFACT_REPOSITORY_NAME" > /dev/null 2>&1
gh secret set GCP_LOCATION --env main -b"$GCP_PROJECT_LOCATION" > /dev/null 2>&1
gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER --env main -b"$GCP_WORKLOAD_IDENTITY_PROVIDER" > /dev/null 2>&1
gh secret set GCP_SERVICE_ACCOUNT_EMAIL --env main -b"$GCP_SERVICE_ACCOUNT_EMAIL" > /dev/null 2>&1
gh secret set UNLEASH_API_URL --env main -b"unleash-fake-url" > /dev/null 2>&1
gh secret set UNLEASH_AUTH_TOKEN --env main -b"unleash-fake-token" > /dev/null 2>&1
gh secret set MONGODB_ATLAS_ORG_ID --env main -b"$MONGODB_ATLAS_ORG_ID" > /dev/null 2>&1
gh secret set MONGODB_ATLAS_PUBLIC_KEY --env main -b"$MONGODB_ATLAS_PUBLIC_KEY" > /dev/null 2>&1
gh secret set MONGODB_ATLAS_PRIVATE_KEY --env main -b"$MONGODB_ATLAS_PRIVATE_KEY" > /dev/null 2>&1
gh secret set NEON_API_KEY --env main -b"$NEON_API_KEY" > /dev/null 2>&1
gh secret set NEON_PROJECT_LOCATION --env main -b"$NEON_PROJECT_LOCATION" > /dev/null 2>&1
gh secret set NX_CLOUD_ACCESS_TOKEN --env main -b"$NX_CLOUD_ACCESS_TOKEN_READ_WRITE" > /dev/null 2>&1
echo "  ✓ Secrets configured for 'main' environment"

# Secrets - pr-open environment
gh secret set NX_CLOUD_ACCESS_TOKEN --env pr-open -b"$NX_CLOUD_ACCESS_TOKEN_READ" > /dev/null 2>&1
echo "  ✓ Secrets configured for 'pr-open' environment"

# Optional Sonar Cloud setup (not in use)
# We opted to integrate using "ClickOps" since it was an easy 2 clicks integration between SonarCloud and GitHub for public repositories
# If in the future we wish to integrate programatically, check the docs: https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/

# SONAR_TOKEN="fake-sonar-coud-token"
# gh secret set SONAR_TOKEN -b $SONAR_TOKEN

########## 3. SETTING UP TERRAFORM
echo ""
echo "Setting up Terraform backend..."

# Clean up old state
rm -rf teams/kernel/iac/production/.terraform 2>/dev/null
rm -rf teams/kernel/iac/production/.terraform.lock.hcl 2>/dev/null
echo "  ✓ Terraform cache cleaned"

# Create backend configuration
cat > teams/kernel/iac/production/backend.tf <<EOF
# This block sets up what backend should be used for Terraform. In this case, we are using Google Cloud Storage.
terraform {
  backend "gcs" {                                # The Google Cloud Storage backend
    bucket = "$GCP_PROJECT_ID-tfstate"           # The name of the bucket to store the state file
    prefix = "production"                        # The path to the state file within the bucket
    # Authentication uses Application Default Credentials (ADC) from Workload Identity Federation
  }
}
EOF
echo "  ✓ Backend configuration created"

########## SETUP COMPLETE
echo ""
echo "✓ Infrastructure bootstrap complete!"
echo ""
echo "Next steps:"
echo "  1. Verify GCP project: gcloud projects describe $GCP_PROJECT_ID"
echo "  2. Initialize Terraform: cd teams/kernel/iac/production && terraform init"
echo "  3. Review GitHub secrets: gh secret list --env main"
echo ""
