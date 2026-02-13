#!/bin/sh

# This script accepts named arguments and cleans up a GCP project with its folder hierarchy

# Expected named arguments:
# --gcp-organization-id
# --gcp-project-id
# --domain

# Call this script with the following command: bash teams/kernel/iac/bootstrap/project-cleanup.sh --gcp-organization-id=$GCP_ORGANIZATION_ID --gcp-project-id=$GCP_PROJECT_ID --domain=$DOMAIN
# Obs.: this script assumes that you are already authenticated with gcloud CLI.

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --gcp-organization-id=*)
    GCP_ORGANIZATION_ID="${i#*=}"
    shift
    ;;
    --gcp-project-id=*)             # This starts a new case statement pattern.
    GCP_PROJECT_ID="${i#*=}"        # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--gcp-project-id=". The ${i#*=} syntax removes the prefix "--gcp-project-id=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
    --domain=*)
    DOMAIN="${i#*=}"
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

# Check if DOMAIN is set
if [ -z "$DOMAIN" ]
then
    echo "Error: --domain flag is required"
    exit 1
fi

# ============================================
# PATH DETECTION FOR FOLDER HIERARCHY
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

echo "Detected path structure:"
echo "  Folders: $FOLDER_NAMES"
echo "  Project base: $PROJECT_BASE_NAME"
echo ""

# Service account name
GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME="terraform-admin"

# Set SERVICE_ACCOUNT_EMAIL
GCP_SERVICE_ACCOUNT_EMAIL="$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

# Define terraform bucket name
GCP_TERRAFORM_STATE_BUCKET_NAME="$GCP_PROJECT_ID-tfstate"

# Define a support group email
GCP_SUPPORT_GROUP_EMAIL="support@$DOMAIN"

########## CLEANUP GOOGLE CLOUD PLATFORM PROJECT
echo "Cleaning up project $GCP_PROJECT_ID..."

# Set project as default
gcloud config set project $GCP_PROJECT_ID

# Delete a service account
gcloud iam service-accounts delete $GCP_SERVICE_ACCOUNT_EMAIL

# Remove terraform state bucket
gsutil rm -r gs://$GCP_TERRAFORM_STATE_BUCKET_NAME

# Delete the support group
gcloud identity groups delete $GCP_SUPPORT_GROUP_EMAIL

# Delete project
echo "Deleting GCP project $GCP_PROJECT_ID..."
gcloud projects delete $GCP_PROJECT_ID --quiet

# Unlink project from billing account
echo "Unlinking billing account..."
gcloud beta billing projects unlink $GCP_PROJECT_ID 2>/dev/null || true

# ============================================
# DELETE FOLDER HIERARCHY
# ============================================

echo ""
echo "Deleting GCP folder hierarchy..."

# Navigate folder hierarchy and collect parent IDs for deletion
# We need to find the leaf folder that contains our project, then delete from leaf to root
CURRENT_PARENT_TYPE="organizations"
CURRENT_PARENT_ID="$GCP_ORGANIZATION_ID"
FOLDER_IDS_FILE=$(mktemp)
trap "rm -f $FOLDER_IDS_FILE" EXIT

# Navigate through folders to find the leaf folder
for folder_name in $FOLDER_NAMES; do
    echo "  Finding folder '$folder_name'..."

    # List folders under current parent
    if [ "$CURRENT_PARENT_TYPE" = "organizations" ]; then
        folder_json=$(gcloud resource-manager folders list \
            --organization="$CURRENT_PARENT_ID" \
            --format="json" 2>/dev/null)
    else
        folder_json=$(gcloud resource-manager folders list \
            --folder="$CURRENT_PARENT_ID" \
            --format="json" 2>/dev/null)
    fi

    # Extract folder ID using jq
    FOLDER_ID=$(echo "$folder_json" | \
        jq -r ".[] | select(.displayName==\"$folder_name\") | .name" | \
        sed 's|folders/||')

    if [ -z "$FOLDER_ID" ] || [ "$FOLDER_ID" = "null" ]; then
        echo "  Warning: Folder '$folder_name' not found, skipping..."
        continue
    fi

    echo "  ✓ Found folder '$folder_name' (ID: $FOLDER_ID)"
    echo "$FOLDER_ID" >> "$FOLDER_IDS_FILE"

    CURRENT_PARENT_TYPE="folders"
    CURRENT_PARENT_ID="$FOLDER_ID"
done

# Delete folders in reverse order (leaf to root)
echo ""
echo "Deleting folders in reverse order (leaf to root)..."
awk '{ a[NR]=$0 } END { for(i=NR; i>=1; i--) print a[i] }' "$FOLDER_IDS_FILE" | while read folder_id; do
    echo "  Deleting folder ID: $folder_id..."

    # Delete the folder
    if gcloud resource-manager folders delete "$folder_id" --quiet 2>/dev/null; then
        echo "  ✓ Deleted folder $folder_id"
    else
        echo "  ✗ Failed to delete folder $folder_id (may have remaining contents)"
    fi
done

echo ""
echo "✓ Cleanup complete!"
