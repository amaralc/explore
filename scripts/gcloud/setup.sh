# Run this script: bash scripts/gcloud/setup.sh

# Define project name
PROJECT_ID="my-pl-test-project"

# Define billing account id
BILLING_ACCOUNT_ID="billing-account-id"

# Define location
PROJECT_LOCATION="europe-west3"

# Docker artifact registry repository name
DOCKER_ARTIFACT_REPOSITORY_NAME="my-docker-repo"


# Create project
# gcloud projects create $PROJECT_ID

# Set project as default
# gcloud config set project $PROJECT_ID

# Enable billing
# gcloud beta billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT_ID

# Enable artifact registry api
# gcloud services enable artifactregistry.googleapis.com

# Create artifact registry repository
# gcloud artifacts repositories create $DOCKER_ARTIFACT_REPOSITORY_NAME --repository-format=docker --location=$PROJECT_LOCATION --description="Docker repository"

# Create a service account
# gcloud iam service-accounts create my-service-account --description="My service account" --display-name="my-service-account"

# Grant artifact registry permissions to the service account
# gcloud projects add-iam-policy-binding $PROJECT_ID --member=serviceAccount:my-service-account@$PROJECT_ID.iam.gserviceaccount.com --role=roles/artifactregistry.writer

# Create a key for the service account
# gcloud iam service-accounts keys create ~/key.json --iam-account my-service-account@$PROJECT_ID.iam.gserviceaccount.com

# Create a secret in github
# ... -> Settings -> Secrets -> New repository secret -> Name: GCR_JSON_KEY -> Value: content of ~/key.json

# Create a docker file with a basic nginx image
# touch Dockerfile && echo "FROM nginx:latest" >> Dockerfile && echo "RUN echo 'Hello world'" >> Dockerfile && echo "EXPOSE 80" >> Dockerfile && echo "CMD [\"nginx\", \"-g\", \"daemon off;\"]" >> Dockerfile

# Create a github action
# # ... -> .github -> workflows -> main.yml

# # name: Build and Push Docker image

# # on:
# #   push:
# #     branches:
# #       - main

# # jobs:
# #   build:
# #     runs-on: ubuntu-latest
# #     environment:
# #       name: main

# #     steps:
# #       - name: Checkout code
# #         uses: actions/checkout@v2

# #       - name: Set up Docker Buildx
# #         uses: docker/setup-buildx-action@v1

# #       - name: Login to Google Container Registry
# #         uses: docker/login-action@v1
# #         with:
# #           registry: ${{ secrets.PROJECT_LOCATION }}-docker.pkg.dev
# #           username: _json_key
# #           password: ${{ secrets.GCR_JSON_KEY }}

# #       - name: Build and push nginx Docker image
# #         uses: docker/build-push-action@v2
# #         with:
# #           context: .
# #           push: true
# #           tags: ${{ secrets.PROJECT_LOCATION }}-docker.pkg.dev/${{ secrets.PROJECT_ID }}/${{ secrets.DOCKER_ARTIFACT_REPOSITORY_NAME }}/${{ env.IMAGE_NAME }}:latest
# #         env:
# #           IMAGE_NAME: my-image

# Push the code to github

# Wait for the github action to finish

# Verify that the docker image was created after github action
# gcloud artifacts docker images list $PROJECT_LOCATION.pkg.dev/$PROJECT_ID/$DOCKER_ARTIFACT_REPOSITORY_NAME

# Delete project
# gcloud projects delete $PROJECT_ID


