# This script writes "affected=true" to a file if the app was affected since last tag before head

# Expected named arguments:
# --project-name (required)
# --file-path (required if you are calling the command from within a bitbucket pipeline)
# --overwrite-file (optional) "true" or "false" (default is "false")
# --fail-if-canceled (optional) "true" or "false" (default is "false")
# --install-node (optional) "true" or "false" (default is "false")
# --install-package-manager (optional) "true" or "false" (default is "false")
# --install-dependencies (optional) "true" or "false" (default is "false")
# --nx-cloud-access-token (optional)

# Call this script with the following command: bash scripts/nx/check-if-app-was-affected.sh --project-name=$PROJECT_NAME --file-path=$FILE_PATH --fail-if-canceled=true --install-node=true --install-package-manager=true --install-dependencies=true
# Obs.: this script assumes that you are already authenticated with gcloud CLI.

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --project-name=*)               # This starts a new case statement pattern.
    PROJECT_NAME="${i#*=}"          # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--project-name=". The ${i#*=} syntax removes the prefix "--project-name=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
    --file-path=*)
    FILE_PATH="${i#*=}"
    shift
    ;;
    --override-file=*)
    OVERRIDE_FILE="${i#*=}"
    shift
    ;;
    --fail-if-canceled=*)
    FAIL_IF_CANCELED="${i#*=}"
    shift
    ;;
    --install-node=*)
    INSTALL_NODE="${i#*=}"
    shift
    ;;
    --install-package-manager=*)
    INSTALL_PACKAGE_MANAGER="${i#*=}"
    shift
    ;;
    --install-dependencies=*)
    INSTALL_DEPENDENCIES="${i#*=}"
    shift
    ;;
    --nx-cloud-access-token=*)
    NX_CLOUD_ACCESS_TOKEN="${i#*=}"
    shift
    ;;
esac                                # This ends the case statement.
done                                # This ends the loop block.

# Verify required values
if [ -z "$PROJECT_NAME" ]
then
    echo "Error: --project-name flag is required"
    exit 1
fi

# Override default values
if [ "$FAIL_IF_CANCELED" != "true" ]; then
  FAIL_IF_CANCELED="false"
fi

# Override default values
if [ "$OVERRIDE_FILE" != "true" ]; then
  OVERRIDE_FILE="false"
fi

if [ "$INSTALL_NODE" != "true" ]; then
  INSTALL_NODE="false"
fi

if [ "$INSTALL_PACKAGE_MANAGER" != "true" ]; then
  INSTALL_PACKAGE_MANAGER="false"
fi

if [ "$INSTALL_DEPENDENCIES" != "true" ]; then
  INSTALL_DEPENDENCIES="false"
fi

# Set nx cloud token to make use of remote caches
if [ "$NX_CLOUD_ACCESS_TOKEN" != "" ]; then
  bash scripts/nx/set-token.sh --access-token=$NX_CLOUD_ACCESS_TOKEN --install-jq=true
fi

# This is only necessary if you are running this script in a CI environment such as gh actions or cloud build step
if [ "$INSTALL_NODE" == "true" ]; then
  # Install nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

  # Load nvm
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

  # Install node 18
  nvm install 18

  # Use node 18
  nvm use 18
fi

if [ "$INSTALL_PACKAGE_MANAGER" == "true" ]; then
  # Install pnpm
  npm install -g pnpm
fi

if [ "$INSTALL_DEPENDENCIES" == "true" ]; then
  # Install
  pnpm install --frozen-lockfile
fi

LAST_TAGGED_COMMIT=$(git for-each-ref --sort=-taggerdate --format '%(objectname)' refs/tags | head -n 1 | tail -n 1)
LAST_TAG=$(git describe $LAST_TAGGED_COMMIT)
echo "Last tag: $LAST_TAG"

LAST_TAGGED_COMMIT_BEFORE_HEAD=$(git for-each-ref --sort=-taggerdate --format '%(objectname)' refs/tags | head -n 2 | tail -n 1)
LAST_TAG_BEFORE_HEAD=$(git describe $LAST_TAGGED_COMMIT_BEFORE_HEAD)
echo "Last tag before HEAD: $LAST_TAG_BEFORE_HEAD"

# Affected
AFFECTED_APPS=$(pnpm nx show projects --affected --base=$LAST_TAG_BEFORE_HEAD --head=$LAST_TAG)
echo 'Affected apps:' $AFFECTED_APPS

if [[ $AFFECTED_APPS == *$PROJECT_NAME* ]]; then
  echo '✅ - Build can proceed since app was affected!'

  if [[ -n $FILE_PATH && $OVERRIDE_FILE == "true" ]]; then
    echo "affected=true" > $FILE_PATH
  fi

  if [[ -n $FILE_PATH && $OVERRIDE_FILE == "false" ]]; then
    echo "affected=true" >> $FILE_PATH
  fi

else
  # If no dependency was affected, cancel build
  echo '🛑 - Build cancelled since no dependency was affected'

  if [[ -n $FILE_PATH && $OVERRIDE_FILE == "true" ]]; then
    echo "affected=false" > $FILE_PATH
  fi

  if [[ -n $FILE_PATH && $OVERRIDE_FILE == "false" ]]; then
    echo "affected=true" >> $FILE_PATH
  fi

  if [ "$FAIL_IF_CANCELED" == "true" ]; then
    fail
  fi
fi

# Override nx cloud script with fake token
if [ "$NX_CLOUD_ACCESS_TOKEN" != "" ]; then
  bash scripts/nx/set-token.sh --access-token=fake-token
fi
