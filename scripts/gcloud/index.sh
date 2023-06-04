# This script creates the basic setup in GCP for running Terraform.
# It creates a project, a service account, and assigns the necessary roles to the service account.
# It also enables the APIs that are required for running Terraform.
# The script assumes that the user has already authenticated with gcloud CLI and set the default project with gcloud config set project PROJECT_ID.

# Expected named arguments:
# --project-id
# --location
# --tf-state-bucket-name
# --repository-name
# --repository-description
# --repository-format
# --service-account-name
# --service-account-description
# --service-account-display-name

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --project-id=*)                 # This starts a new case statement pattern.
    PROJECT_ID="${i#*=}"            # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--project-id=". The ${i#*=} syntax removes the prefix "--project-id=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
    --location=*)
    LOCATION="${i#*=}"
    shift
    ;;
    --tf-state-bucket-name=*)
    TF_STATE_BUCKET_NAME="${i#*=}"
    shift
    ;;
    --repository-name=*)
    REPOSITORY_NAME="${i#*=}"
    shift
    ;;
    --repository-description=*)
    REPOSITORY_DESCRIPTION="${i#*=}"
    shift
    ;;
    --repository-format=*)
    REPOSITORY_FORMAT="${i#*=}"
    shift
    ;;
    --service-account-name=*)
    SERVICE_ACCOUNT_NAME="${i#*=}"
    shift
    ;;
    --service-account-description=*)
    SERVICE_ACCOUNT_DESCRIPTION="${i#*=}"
    shift
    ;;
    --service-account-display-name=*)
    SERVICE_ACCOUNT_DISPLAY_NAME="${i#*=}"
    shift
    ;;
esac                                # This ends the case statement.
done                                # This ends the loop block.


# Enable APIs
bash ./scripts/gcloud/project-enable-apis.sh --project-id=$PROJECT_ID

# Create Terraform Bucket
bash ./scripts/gcloud/storage-bucket-create.sh --project-id=$PROJECT_ID --location=$LOCATION --bucket-name=$TF_STATE_BUCKET_NAME

# Create Artifact Registry docker repository
bash ./scripts/gcloud/artifact-registry-setup.sh --project-id=$PROJECT_ID --location=$LOCATION --repository-name=$REPOSITORY_NAME --repository-description=$REPOSITORY_DESCRIPTION --repository-format=$REPOSITORY_FORMAT

# Create Service Account
bash ./scripts/gcloud/service-account-create.sh --project-id=$PROJECT_ID --service-account-name=$SERVICE_ACCOUNT_NAME --description=$SERVICE_ACCOUNT_DESCRIPTION --display-name=$SERVICE_ACCOUNT_DISPLAY_NAME

# Add IAM Policy Bindings
bash ./scripts/gcloud/iam-policy-bindings.sh --project-id=$PROJECT_ID --service-account-name=$SERVICE_ACCOUNT_NAME
