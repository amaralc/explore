LAST_MERGE_COMMIT_BEFORE_HEAD=$(git log --merges -n 2 --pretty=format:"%H" | tail -n 1)
echo 'Last merge commit before head:' $LAST_MERGE_COMMIT_BEFORE_HEAD

pnpm install

AFFECTED_APPS=$(npx nx print-affected --type=app --select=projects --base=$LAST_MERGE_COMMIT_BEFORE_HEAD)
echo 'Affected apps:' $AFFECTED_APPS

PROJECT_NAME=researchers-peers-svc-rest-api
if [[ $AFFECTED_APPS == *$PROJECT_NAME* ]]; then
  echo '✅ - Build can proceed since app was affected!'
  echo "affected=false" >> $GITHUB_ENV # TODO: Change to true in order to proceed
else
  # If no dependency was affected, cancel build
  echo '🛑 - Build cancelled since no dependency was affected'
  echo "affected=false" >> $GITHUB_ENV
fi
