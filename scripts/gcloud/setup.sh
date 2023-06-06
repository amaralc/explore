# Run this script: bash scripts/gcloud/setup.sh

# Define project name
GCP_PROJECT_ID="project-id"

# Define billing account id
GCP_BILLING_ACCOUNT_ID="billing-account-id"

# Define location
GCP_PROJECT_LOCATION="europe-west3"

# Docker artifact registry repository name
GCP_DOCKER_ARTIFACT_REPOSITORY_NAME="docker-repository"

# Service account name
GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME="terraform-admin"




# Create project
# gcloud projects create $GCP_PROJECT_ID

# Set project as default
# gcloud config set project $GCP_PROJECT_ID

# Enable billing
# gcloud beta billing projects link $GCP_PROJECT_ID --billing-account=$GCP_BILLING_ACCOUNT_ID

# Enable artifact registry api
# gcloud services enable artifactregistry.googleapis.com

# Create artifact registry repository
# gcloud artifacts repositories create $GCP_DOCKER_ARTIFACT_REPOSITORY_NAME --repository-format=docker --location=$GCP_PROJECT_LOCATION --description="Docker repository"

# Create a service account
# gcloud iam service-accounts create $GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME --description="Terraform Admin" --display-name=$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME

# Grant artifact registry permissions to the service account
# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member=serviceAccount:$GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com --role=roles/artifactregistry.writer

# Create a key for the service account
# gcloud iam service-accounts keys create ./key.json --iam-account $GCP_TF_ADMIN_SERVICE_ACCOUNT_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com

# Create a secret in github
# ... -> Settings -> Secrets -> New repository secret -> Name: GCP_TF_ADMIN_SERVICE_ACCOUNT_KEY -> Value: content of ~/key.json

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
# #           registry: ${{ secrets.GCP_PROJECT_LOCATION }}-docker.pkg.dev
# #           username: _json_key
# #           password: ${{ secrets.GCP_TF_ADMIN_SERVICE_ACCOUNT_KEY }}

# #       - name: Build and push nginx Docker image
# #         uses: docker/build-push-action@v2
# #         with:
# #           context: .
# #           push: true
# #           tags: ${{ secrets.GCP_PROJECT_LOCATION }}-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/${{ secrets.GCP_DOCKER_ARTIFACT_REPOSITORY_NAME }}/${{ env.IMAGE_NAME }}:latest
# #         env:
# #           IMAGE_NAME: my-image

# Push the code to github

# Wait for the github action to finish

# Verify that the docker image was created after github action
# gcloud artifacts docker images list $GCP_PROJECT_LOCATION.pkg.dev/$GCP_PROJECT_ID/$GCP_DOCKER_ARTIFACT_REPOSITORY_NAME

# Delete project
# gcloud projects delete $GCP_PROJECT_ID


