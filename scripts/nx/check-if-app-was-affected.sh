# This script writes "affected=true" to a file if the app was affected since last tag before head

# Expected named arguments:
# --project-name
# --file-path

# Call this script with the following command: bash scripts/nx/check-if-app-was-affected.sh --project-name=$PROJECT_NAME --file-path=$FILE_PATH
# Obs.: this script assumes that you are already authenticated with gcloud CLI.

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --project-name=*)             # This starts a new case statement pattern.
    PROJECT_NAME="${i#*=}"        # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--project-name=". The ${i#*=} syntax removes the prefix "--project-name=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
    --file-path=*)
    FILE_PATH="${i#*=}"
    shift
    ;;
esac                                # This ends the case statement.
done                                # This ends the loop block.

# Check if PROJECT_NAME is set
if [ -z "$PROJECT_NAME" ]
then
    echo "Error: --project-name flag is required"
    exit 1
fi

# Check if FILE_PATH is set
if [ -z "$FILE_PATH" ]
then
    echo "Error: --file-path flag is required"
    exit 1
fi

LAST_TAGGED_COMMIT_BEFORE_HEAD=$(git for-each-ref --sort=-taggerdate --format '%(objectname)' refs/tags | head -n 2 | tail -n 1)
LAST_TAG_BEFORE_HEAD=$(git describe $LAST_TAGGED_COMMIT_BEFORE_HEAD)
echo "Last tag before HEAD: $LAST_TAG_BEFORE_HEAD"

# Install
pnpm install

# Affected
AFFECTED_APPS=$(npx nx print-affected --type=app --select=projects --base=$LAST_TAGGED_COMMIT_BEFORE_HEAD)
echo 'Affected apps:' $AFFECTED_APPS

PROJECT_NAME=researchers-peers-svc-rest-api
if [[ $AFFECTED_APPS == *$PROJECT_NAME* ]]; then
  echo '✅ - Build can proceed since app was affected!'
  echo "affected=true" >> $FILE_PATH
else
  # If no dependency was affected, cancel build
  echo '🛑 - Build cancelled since no dependency was affected'
  echo "affected=true" >> $FILE_PATH # TODO: Change to false
fi
