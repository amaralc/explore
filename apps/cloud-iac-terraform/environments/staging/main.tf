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

# The module name is the name of the directory containing the module
module "researchers-peers-svc-rest-api" {
  source       = "../../modules/researchers-peers-svc-rest-api"
  environment  = local.environment # The deployment environment (staging | production)
  project_id   = var.project_id    # The Google Cloud project ID
  region       = var.region        # The region where resources will be created
  database_url = var.database_url  # The database URL connection string
  direct_url   = var.direct_url    # The direct URL string
  commit_hash  = var.commit_hash   # The commit hash of the source code to deploy
}

