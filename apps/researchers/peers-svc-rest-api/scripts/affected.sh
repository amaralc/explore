#!/bin/bash

# Checks weather the project was affected (true) or not (false) logging the result to the console

# Usage:
# bash apps/researchers/peers/svc-rest-api/scripts/affected.sh > /dev/null && echo 'true' || echo 'false'

# Vercel ignored build steps: https://vercel.com/guides/how-do-i-use-the-ignored-build-step-field-on-vercel
# Import and execute script (https://stackoverflow.com/questions/12815774/importing-functions-from-a-shell-script)
source tools/build/nx-ignore.sh

# Call function defined in tools/vercel/nx-ignore.sh to set affected apps and libs
setAffectedAppsAndLibs

# Set env var with the app or lib you wish to verify
PROJECT_NAME=researchers-peers-svc-rest-api

# If string with the name of the app is a substring of AFFECTED_APPS string then proceed with the build
if [[ $AFFECTED_APPS == *$PROJECT_NAME* ]]; then
  echo '✅ - App was affected!'
  exit 0 # Success (true)
else
  # If no dependency was affected, cancel build
  echo '🛑 - App was not affected'
  exit 1 # Failure (false)
fi
