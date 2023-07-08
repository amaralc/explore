#!/bin/bash

# This script accepts named arguments and overrites the token from nx.json with a token of your choice
# Run this script: bash scripts/nx/set-token.sh

# Expected named arguments:
# --access-token

# Call this script with the following command: bash scripts/nx/set-token.sh --access-token=my-secret-token

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --access-token=*)               # This starts a new case statement pattern.
    ACCESS_TOKEN="${i#*=}"          # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--access-token=". The ${i#*=} syntax removes the prefix "--access-token=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
esac                                # This ends the case statement.
done                                # This ends the loop block.

# Check if ACCESS_TOKEN is set
if [ -z "$ACCESS_TOKEN" ]
then
    echo "Error: --access-token flag is required"
    exit 1
fi

# Overrite token from nx.json
jq --arg access_token "$ACCESS_TOKEN" '.tasksRunnerOptions.default.options.accessToken = $access_token' nx.json > tmp.$$.json && mv tmp.$$.json nx.json
