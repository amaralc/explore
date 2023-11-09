# This script accepts named arguments and push an image to container registry

# Expected named arguments:
# --gcp-project-id
# --domain

# Call this script with the following command: bash apps/core/platform-shell-iac/project-setup.sh --gcp-project-id=$GCP_PROJECT_ID --domain=$DOMAIN
# Obs.: this script assumes that you are already authenticated with gcloud CLI.

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
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
gcloud projects delete $GCP_PROJECT_ID

# Unlink project from billing account
gcloud beta billing projects unlink $GCP_PROJECT_ID

# Manual steps

# # Remember to manually remove the service account principal role from your organization at https://console.cloud.google.com/cloud-resource-manager
