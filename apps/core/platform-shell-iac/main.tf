module "production" {
  environment_name                    = "production"                            # The deployment environment (branch-name, commit-hash, etc.)
  source                              = "./production-environment"              # The path to the module
  vercel_api_token                    = var.vercel_api_token                    # Vercel API token
  neon_api_key                        = var.neon_api_key                        # Neon API key
  neon_project_location               = var.neon_project_location               # The Neon project region
  project_id                          = var.project_id                          # The Google Cloud project ID
  region                              = var.region                              # The region where resources will be created
  commit_hash                         = var.commit_hash                         # Force new cloud run revision to be created
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name # The name of the Docker repository
}


module "staging" {
  environment_name                    = "staging"                               # The deployment environment (branch-name, commit-hash, etc.)
  source                              = "./preview-environment"                 # The path to the module
  vercel_api_token                    = var.vercel_api_token                    # Vercel API token
  neon_api_key                        = var.neon_api_key                        # Neon API key
  neon_project_id                     = module.production.neon_project_id       # The Neon project ID
  project_id                          = var.project_id                          # The Google Cloud project ID
  region                              = var.region                              # The region where resources will be created
  commit_hash                         = var.commit_hash                         # Force new cloud run revision to be created
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name # The name of the Docker repository
}

# module "feature-PEER-550-neon-db-terraform-environment" {
#   source                              = "./preview-environment"                 # The path to the module
#   environment_name                    = "feature-PEER-550-neon-db-terraform"    # The deployment environment (branch-name, commit-hash, etc.)
#   neon_project_id                     = neon_project.peerlab-platform.id        # The Neon project ID
#   project_id                          = var.project_id                          # The Google Cloud project ID
#   region                              = var.region                              # The region where resources will be created
#   commit_hash                         = var.commit_hash                         # Force new cloud run revision to be created
#   gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name # The name of the Docker repository
# }

