#!/bin/bash

# This script accepts named arguments and create a storage bucket with versioning and logging enabled

# Expected named arguments:
# --project-id
# --location (https://cloud.google.com/storage/docs/locations, ex.: europe-west3)
# --bucket-name

# Call this script with the following command: bash ./scripts/gcloud/storage-bucket-create.sh --project-id=PROJECT_ID --location=LOCATION --bucket-name=BUCKET_NAME
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
    --location=*)                   # This starts a new case statement pattern.
    LOCATION="${i#*=}"              # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--location=". The ${i#*=} syntax removes the prefix "--location=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
    --bucket-name=*)                # This starts a new case statement pattern.
    BUCKET_NAME="${i#*=}"           # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--bucket-name=". The ${i#*=} syntax removes the prefix "--location=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
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

# Check if BUCKET_NAME is set
if [ -z "$BUCKET_NAME" ]
then
    echo "Error: --bucket-name flag is required"
    exit 1
fi

# Create a bucket
gsutil mb -p $PROJECT_ID -l ${LOCATION} gs://${BUCKET_NAME}

# Enable versioning
# This will keep a version history of your state files, which can help you recover from both accidental deletions and unintended modifications.
gsutil versioning set on gs://${BUCKET_NAME}

# Enable bucket logging
# This will log all access to your bucket, which can help you monitor who is accessing your state files and when
gsutil logging set on -b gs://${BUCKET_NAME} -o AccessLog gs://${BUCKET_NAME}

# References:
# - https://cloud.google.com/storage/docs/creating-buckets
