# This script writes "affected=true" to a file if the app was affected since last tag before head

# Expected named arguments:
# --project-name (required)

# Call this script with the following command: bash scripts/nx/get-tag-to-build.sh --project-name=$PROJECT_NAME

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --project-name=*)               # This starts a new case statement pattern.
    PROJECT_NAME="${i#*=}"          # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--project-name=". The ${i#*=} syntax removes the prefix "--project-name=" from the argument.
    shift                           # This removes the current argument from the list of arguments. This is necessary because the argument is no longer needed.
    ;;                              # This ends the case statement pattern.
esac                                # This ends the case statement.
done                                # This ends the loop block.

# Verify required values
if [ -z "$PROJECT_NAME" ]
then
    echo "Error: --project-name flag is required"
    exit 1
fi

# Get the latest tag
LAST_TAGGED_COMMIT=$(git for-each-ref --sort=-taggerdate --format '%(objectname)' refs/tags | head -n 1 | tail -n 1)
LAST_TAG=$(git describe $LAST_TAGGED_COMMIT)

# Get the latest tag before head
LAST_TAGGED_COMMIT_BEFORE_HEAD=$(git for-each-ref --sort=-taggerdate --format '%(objectname)' refs/tags | head -n 2 | tail -n 1)
LAST_TAG_BEFORE_HEAD=$(git describe $LAST_TAGGED_COMMIT_BEFORE_HEAD)

# Get the affected apps
AFFECTED_APPS=$(npx nx print-affected --type=app --select=projects --base=$LAST_TAGGED_COMMIT_BEFORE_HEAD)


if [[ $AFFECTED_APPS == *$PROJECT_NAME* ]]; then
  echo "{\"tag\": \"$LAST_TAG\"}"
else
  echo "{\"tag\": \"$LAST_TAG_BEFORE_HEAD\"}"
fi