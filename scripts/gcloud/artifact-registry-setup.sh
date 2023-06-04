#!/bin/bash

# This script accepts named arguments and create a storage bucket with versioning and logging enabled

# Expected named arguments:
# --project-id
# --location (https://cloud.google.com/storage/docs/locations, ex.: europe-west3)
# --repository-format (ex.: docker)
# --repository-name

# Call this script with the following command: bash ./scripts/gcloud/artifact-registry-setup.sh --project-id=PROJECT_ID --location=LOCATION --repository-name=REPOSITORY_NAME --repository-description=REPOSITORY_DESCRIPTION --repository-format=REPOSITORY_FORMAT
# Obs.: this script assumes that the user has already authenticated with gcloud CLI and set the default project with gcloud config set project PROJECT_ID

# Parse command line arguments
# The loop iterates over all arguments
# For each argument, it checks if it matches one of the expected argument formats (--project-id=*, --location=*)
# If an argument matches, it removes the prefix (e.g., --project-id=) and assigns the rest of the argument to a variable

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
    --repository-name=*)
    REPOSITORY_NAME="${i#*=}"
    shift
    ;;
    --repository-format=*)
    REPOSITORY_FORMAT="${i#*=}"
    shift
    ;;
esac                                # This ends the case statement.
done                                # This ends the loop block.

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]
then
    echo "Error: --project-id flag is required"
    exit 1
fi

# Check if LOCATION is set
if [ -z "$LOCATION" ]
then
    echo "Error: --location flag is required"
    exit 1
fi

# Check if REPOSITORY_FORMAT is set
if [ -z "$REPOSITORY_FORMAT" ]
then
    echo "Error: --repository-format flag is required"
    exit 1
fi

# Check if REPOSITORY_NAME is set
if [ -z "$REPOSITORY_NAME" ]
then
    echo "Error: --repository-name flag is required"
    exit 1
fi

# Create an artifact registry repository
gcloud artifacts repositories create $REPOSITORY_NAME --repository-format=$REPOSITORY_FORMAT --location=$LOCATION --project=$PROJECT_ID
