# PostgreSql Database
# Reference: https://registry.terraform.io/providers/kislerdm/neon/latest/docs
resource "neon_project" "peerlab-platform" {
  name                     = "peerlab-platform"        # Use the same project ID as in the Google Cloud provider
  region_id                = var.neon_project_location #"aws-eu-central-1"
  autoscaling_limit_max_cu = 1
}

# Application Shell
module "core-platform-shell-app-production" {
  source           = "../../../../core/platform/platform-shell-app/iac/production" # The path to the module
  environment_name = "production"                                                  # The deployment environment (branch-name, commit-hash, etc.)
  vercel_api_token = var.vercel_api_token                                          # The Vercel API token
}

# Documentation with Docusaurus
module "dx-dev-docs-app-production" {
  source           = "../../../../dx/dev-docs-app/iac/production" # The path to the module
  environment_name = "production"                                 # The deployment environment (branch-name, commit-hash, etc.)
  vercel_api_token = var.vercel_api_token                         # The Vercel API token
}

# # Peers Service
# module "researchers-peers-svc-rest-api" {
#   source                              = "../../../../researchers/peers/svc-rest-api/iac" # The path to the module
#   environment                         = var.environment                                  # The deployment environment (staging | production)
#   project_id                          = var.project_id                                   # The Google Cloud project ID
#   region                              = var.region                                       # The region where resources will be created
#   database_url                        = var.database_url                                 # The database URL connection string
#   direct_url                          = var.direct_url                                   # The direct URL string
#   commit_hash                         = var.commit_hash                                  # The commit hash of the source code to deploy
#   gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name          # The name of the Docker repository
# }
