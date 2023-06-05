#!/bin/bash

# This script accepts named arguments and create a service account

# Expected named arguments:
# --project-id
# --service-account-name
# --description
# --display-name

# Call this script with the following command: bash ./scripts/gcloud/04-service-account-create.sh --project-id=PROJECT_ID --service-account-name=SERVICE_ACCOUNT_NAME --description=DESCRIPTION --display-name=DISPLAY_NAME
# Obs.: this script assumes that the user has already authenticated with gcloud CLI and set the default project with gcloud config set project PROJECT_ID

# Parse command line arguments
# The loop iterates over all arguments
# For each argument, it checks if it matches one of the expected argument formats (--project-id=*, --service-account-name=*)
# If an argument matches, it removes the prefix (e.g., --project-id=) and assigns the rest of the argument to a variable

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --project-id=*)                 # This starts a new case statement pattern.
    PROJECT_ID="${i#*=}"            # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--project-id=". The ${i#*=} syntax removes the prefix "--project-id=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
    --service-account-name=*)
    SERVICE_ACCOUNT_NAME="${i#*=}"
    shift
    ;;
    --description=*)
    DESCRIPTION="${i#*=}"
    shift
    ;;
    --display-name=*)
    DISPLAY_NAME="${i#*=}"
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

# Check if SERVICE_ACCOUNT_NAME is set
if [ -z "$SERVICE_ACCOUNT_NAME" ]
then
    echo "Error: --service-account-name flag is required"
    exit 1
fi

# Check if DESCRIPTION is set
if [ -z "$DESCRIPTION" ]
then
    echo "Error: --description flag is required"
    exit 1
fi

# Check if DISPLAY_NAME is set
if [ -z "$DISPLAY_NAME" ]
then
    echo "Error: --display-name flag is required"
    exit 1
fi

# CLI commands

# Create a service account
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME --description="$DESCRIPTION" --display-name="$DISPLAY_NAME" --project=$PROJECT_ID

# References:
# - https://cloud.google.com/iam/docs/creating-managing-service-accounts
