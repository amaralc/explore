# Get last merge commit for current branch
getLastMergeCommitBeforeHead(){
  LAST_MERGE_COMMIT_BEFORE_HEAD=$(git log --merges -n 2 --pretty=format:"%H" | tail -n 1)
  echo 'Last merge commit before head:' $LAST_MERGE_COMMIT_BEFORE_HEAD
}

# Define affected variables for preview
setAffectedAppsAndLibs(){
  # Install dependencies
  pnpm install

  # Get last merge commit for current branch
  getLastMergeCommitBeforeHead
  echo '---'

  # Set affected apps and libs
  AFFECTED_APPS=$(npx nx print-affected --type=app --select=projects --base=$LAST_MERGE_COMMIT_BEFORE_HEAD)
  AFFECTED_LIBS=$(npx nx print-affected --type=lib --select=projects --base=$LAST_MERGE_COMMIT_BEFORE_HEAD)
  echo '---'
  echo 'Affected apps:' $AFFECTED_APPS
  echo 'Affected libs:' $AFFECTED_LIBS
  echo '---'
}
