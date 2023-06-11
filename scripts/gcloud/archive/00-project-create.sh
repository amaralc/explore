# This script accepts named arguments and push an image to container registry

# Expected named arguments:
# --project-id

# Call this script with the following command: bash ./scripts/gcloud/00-project-create.sh --project-id=PROJECT_ID
# Obs.: this script assumes that you are already authenticated with gcloud CLI.

for i in "$@"                       # This starts a loop that iterates over each argument passed to the script. "$@" is a special variable in bash that holds all arguments passed to the script.
do                                  # This is the start of the loop block.
case $i in                          # This starts a case statement, which checks the current argument ($i) against several patterns.
    --project-id=*)                 # This starts a new case statement pattern.
    PROJECT_ID="${i#*=}"            # Assign the value after the equal sign, to a variable. This pattern matches any argument that starts with "--project-id=". The ${i#*=} syntax removes the prefix "--project-id=" from the argument.
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

# Create a new project
gcloud projects create $PROJECT_ID
