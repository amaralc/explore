# Local variables
locals {
  environment = "staging"
}

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
