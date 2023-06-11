# PostgreSql Database
# Reference: https://registry.terraform.io/providers/kislerdm/neon/latest/docs
resource "neon_project" "core-platform-iac-persistence" {
  name                     = "core-platform-iac-persistence"
  region_id                = "aws-eu-central-1"
  autoscaling_limit_max_cu = 1
}

resource "neon_branch" "core-platform-iac-persistence" {
  project_id = neon_project.core-platform-iac-persistence.id
  name       = var.environment
}

resource "neon_role" "core-platform-iac-persistence" {
  project_id = neon_project.core-platform-iac-persistence.id
  branch_id  = neon_branch.core-platform-iac-persistence.id
  name       = "myrole"
}

resource "neon_database" "core-platform-iac-persistence" {
  project_id = neon_project.core-platform-iac-persistence.id
  branch_id  = neon_branch.core-platform-iac-persistence.id
  name       = "mydb"
  owner_name = neon_role.core-platform-iac-persistence.name
}

# Application Shell
module "core-platform-app-shell" {
  source           = "../../../core/platform/app-shell/iac" # The path to the module
  vercel_api_token = var.vercel_api_token                   # The Vercel API token
}

# Documentation with Docusaurus
module "dx-docs-docusaurus" {
  source           = "../../../dx/docs-docusaurus/iac" # The path to the module
  vercel_api_token = var.vercel_api_token              # The Vercel API token
}

# Peers Service
module "researchers-peers-svc-rest-api" {
  source                              = "../../../researchers/peers/svc-rest-api/iac" # The path to the module
  environment                         = var.environment                               # The deployment environment (staging | production)
  project_id                          = var.project_id                                # The Google Cloud project ID
  region                              = var.region                                    # The region where resources will be created
  database_url                        = var.database_url                              # The database URL connection string
  direct_url                          = var.direct_url                                # The direct URL string
  commit_hash                         = var.commit_hash                               # The commit hash of the source code to deploy
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name       # The name of the Docker repository
}


