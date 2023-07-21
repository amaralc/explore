# Run this script: bash apps/core/platform-shell-iac/project-setup.sh

# This script accepts named arguments and push an image to container registry

# Expected named arguments:
# --atlassian-domain
# --atlassian-cloud-id
# --atlassian-user-email
# --atlassian-user-api-token
# --compass-external-event-source-id
# --pipeline-run-id
# --repository-name


# Call this script with the following command: bash scripts/compass/emmit-deployment-event.sh --atlassian-domain=$ATLASSIAN_DOMAIN --atlassian-cloud-id=$ATLASSIAN_CLOUD_ID --atlassian-user-email=$ATLASSIAN_USER_EMAIL --atlassian-user-api-token=$ATLASSIAN_USER_API_TOKEN --compass-external-event-source-id=$COMPASS_EXTERNAL_EVENT_SOURCE_ID --pipeline-run-id=$PIPELINE_RUN_ID --repository-name=$REPOSITORY_NAME
# Obs.: this script assumes that you are already authenticated with gcloud CLI.

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --atlassian-domain=*)           # This starts a new case statement pattern.
    ATLASSIAN_DOMAIN="${i#*=}"      # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--atlassian-domain=". The ${i#*=} syntax removes the prefix "--atlassian-domain=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
    --atlassian-cloud-id=*)
    ATLASSIAN_CLOUD_ID="${i#*=}"
    shift
    ;;
    --atlassian-user-email=*)
    ATLASSIAN_USER_EMAIL="${i#*=}"
    shift
    ;;
    --atlassian-user-api-token=*)
    ATLASSIAN_USER_API_TOKEN="${i#*=}"
    shift
    ;;
    --compass-external-event-source-id=*)
    COMPASS_EXTERNAL_EVENT_SOURCE_ID="${i#*=}"
    shift
    ;;
    --pipeline-run-id=*)
    PIPELINE_RUN_ID="${i#*=}"
    shift
    ;;
    --repository-name=*)
    REPOSITORY_NAME="${i#*=}"
    shift
    ;;
esac                                # This ends the case statement.
done                                # This ends the loop block.

# Check if ATLASSIAN_DOMAIN is set
if [ -z "$ATLASSIAN_DOMAIN" ]
then
    echo "Error: --atlassian-domain flag is required"
    exit 1
fi

# Check if ATLASSIAN_CLOUD_ID is set
if [ -z "$ATLASSIAN_CLOUD_ID" ]
then
    echo "Error: --atlassian-cloud-id flag is required"
    exit 1
fi

# Check if ATLASSIAN_USER_EMAIL is set
if [ -z "$ATLASSIAN_USER_EMAIL" ]
then
    echo "Error: --atlassian-user-email flag is required"
    exit 1
fi

# Check if ATLASSIAN_USER_API_TOKEN is set
if [ -z "$ATLASSIAN_USER_API_TOKEN" ]
then
    echo "Error: --atlassian-user-api-token flag is required"
    exit 1
fi

# Check if COMPASS_EXTERNAL_EVENT_SOURCE_ID is set
if [ -z "$COMPASS_EXTERNAL_EVENT_SOURCE_ID" ]
then
    echo "Error: --compass-external-event-source-id flag is required"
    exit 1
fi

# Check if PIPELINE_RUN_ID is set
if [ -z "$PIPELINE_RUN_ID" ]
then
    echo "Error: --pipeline-run-id flag is required"
    exit 1
fi

# Check if REPOSITORY_NAME is set
if [ -z "$REPOSITORY_NAME" ]
then
    echo "Error: --repository-name flag is required"
    exit 1
fi

# Construct the URL of the pipeline
PIPELINE_URL="https://github.com/$repo_name/actions/runs/$run_id"

curl \
    --request POST \
    --url https://$ATLASSIAN_DOMAIN.atlassian.net/gateway/api/compass/v1/events \
    --user "$ATLASSIAN_USER_EMAIL:$ATLASSIAN_USER_API_TOKEN" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --data "{
        \"cloudId\": \"$ATLASSIAN_CLOUD_ID\",
        \"event\": {
            \"deployment\": {
                \"updateSequenceNumber\": 2,
                \"displayName\": \"Production Deployment\",
                \"description\": \"Production Deployment\",
                \"url\": \"https://www.peerlab.com.br\",
                \"lastUpdated\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\",
                \"externalEventSourceId\": \"$COMPASS_EXTERNAL_EVENT_SOURCE_ID\",
                \"deploymentProperties\": {
                    \"sequenceNumber\": 2,
                    \"state\": \"SUCCESSFUL\",
                    \"pipeline\": {
                        \"pipelineId\": \"$PIPELINE_RUN_ID\",
                        \"url\": \"$PIPELINE_URL\",
                        \"displayName\": \"Production Pipeline\"
                      },
                    \"environment\": {
                        \"category\": \"PRODUCTION\",
                        \"displayName\": \"Production\",
                        \"environmentId\": \"1\"
                    }
                }
            }
        }
    }"
