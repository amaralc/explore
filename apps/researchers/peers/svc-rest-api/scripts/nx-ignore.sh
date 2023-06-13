#!/bin/bash

# Vercel ignored build steps: https://vercel.com/guides/how-do-i-use-the-ignored-build-step-field-on-vercel
# Import and execute script (https://stackoverflow.com/questions/12815774/importing-functions-from-a-shell-script)
source tools/build/nx-ignore.sh

# Call function defined in tools/vercel/nx-ignore.sh to set affected apps and libs
setAffectedAppsAndLibs

# Set env var with the app or lib you wish to verify
PROJECT_NAME=researchers-peers-svc-rest-api

# If string with the name of the app is a substring of AFFECTED_APPS string then proceed with the build
if [[ $AFFECTED_APPS == *$PROJECT_NAME* ]]; then
  echo '✅ - Build can proceed since app was affected!'

  # Return exit code 1
  exit 1;
else
  # If no dependency was affected, cancel build
  echo '🛑 - Build cancelled since no dependency was affected'

  # Return exit code 0
  exit 0;
fi
