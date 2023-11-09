# IMAGE_EXISTS=$(gcloud container images list-tags ${{ secrets.GCP_LOCATION }}-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/${{ secrets.GCP_DOCKER_ARTIFACT_REPOSITORY_NAME }}/${{ env.IMAGE_NAME }} --filter="tags:${{ env.parsed_branch_name }}" --format=json | jq '. | length')
# if [ $IMAGE_EXISTS -eq 0 ]; then
#   echo "is_existing_image=false" >> $GITHUB_ENV
# else
#   echo "is_existing_image=true" >> $GITHUB_ENV
# fi

resource "null_resource" "build_or_not" {
  triggers = {
    # affected_short_commit_sha = module.nx_affected.short_commit_sha
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = <<EOF
#!/bin/bash
echo "Authenticating with Google Cloud..."
gcloud auth activate-service-account --key-file=credentials.json

echo "Navigating to root"
cd ${path.cwd}/../../../../

echo "Check affected commit sha..."
echo ${var.short_commit_sha}

echo "Setting project name..."
PROJECT_NAME=${var.nx_project_name}

echo "Checking if app was affected..."
LAST_TAGGED_COMMIT=$(git for-each-ref --sort=-taggerdate --format '%(objectname)' refs/tags | head -n 1 | tail -n 1)
LAST_TAG=$(git describe $LAST_TAGGED_COMMIT)
echo "Last tag: $LAST_TAG"

LAST_TAGGED_COMMIT_BEFORE_HEAD=$(git for-each-ref --sort=-taggerdate --format '%(objectname)' refs/tags | head -n 2 | tail -n 1)
LAST_TAG_BEFORE_HEAD=$(git describe $LAST_TAGGED_COMMIT_BEFORE_HEAD)
echo "Last tag before HEAD: $LAST_TAG_BEFORE_HEAD"

# Affected
AFFECTED_APPS=$(pnpm nx show projects --affected --base=$LAST_TAG_BEFORE_HEAD --head=$LAST_TAG)
echo 'Affected apps:' $AFFECTED_APPS

# TODO: Check if image exist. If not, build it.

if echo "$AFFECTED_APPS" | grep -q "$PROJECT_NAME"; then
  echo '✅ - Build can proceed since the project was affected' # TODO: Build image also if there is no image in the registry
  ${var.build_script} 
else
  # If no dependency was affected, cancel build
  echo '🛑 - Build cancelled since no dependency was affected and image already exist'
fi
EOF
  }
}
