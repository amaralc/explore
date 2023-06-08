# Local variables
locals {
  environment = "staging"
}

# Configure the Google Cloud Provider for Terraform
provider "google" {
  credentials = file(var.credentials_path) # The service account key
  project     = var.project_id             # Your Google Cloud project ID
  region      = var.region                 # The region where resources will be created
}

# The google-beta provider is used for features not yet available in the google provider
provider "google-beta" {
  credentials = file(var.credentials_path) # The service account key
  project     = var.project_id             # Your Google Cloud project ID
  region      = var.region                 # The region where resources will be created
}

# # The Vercel provider is only used in the terraform production environment since the module already deals with other environments by itself
# provider "vercel" {
#   api_token = var.vercel_api_token
# }

# Peers Service
module "researchers-peers-svc-rest-api" {
  source                              = "../../../../researchers/peers/svc-rest-api/iac"
  environment                         = local.environment                       # The deployment environment (staging | production)
  project_id                          = var.project_id                          # The Google Cloud project ID
  region                              = var.region                              # The region where resources will be created
  database_url                        = var.database_url                        # The database URL connection string
  direct_url                          = var.direct_url                          # The direct URL string
  commit_hash                         = var.commit_hash                         # The commit hash of the source code to deploy
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name # The name of the Docker repository
}
