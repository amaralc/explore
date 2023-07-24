#!/bin/bash

# This script accepts a branch name and parse it to a smaller code

# Expected named arguments:
# --branch-name

# Call this script with the following command: bash scripts/deploy/parse-branch-name-to-environment-code.sh --branch-name=$BRANCH_NAME --gcp-billing-account-id=$GCP_BILLING_ACCOUNT_ID
# Obs.: this script assumes that you are already authenticated with gcloud CLI.

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --branch-name=*)             # This starts a new case statement pattern.
    BRANCH_NAME="${i#*=}"        # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--branch-name=". The ${i#*=} syntax removes the prefix "--branch-name=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
esac                                # This ends the case statement.
done                                # This ends the loop block.

# Check if BRANCH_NAME is set
if [ -z "$BRANCH_NAME" ]
then
    echo "Error: --branch-name flag is required"
    exit 1
fi

# Calculate the SHA256 hash of the string, convert it to lowercase and remove special characters
SHA_256_HASH=$(echo -n $BRANCH_NAME | sha256sum | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')

# Add env prefix and use first 10 characters of the hash
ENVIRONMENT_NAME=$(echo env-${SHA_256_HASH:0:8})

# Print the base64-encoded SHA256 hash
echo "$ENVIRONMENT_NAME"
