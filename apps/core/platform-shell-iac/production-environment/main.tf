# PostgreSQL Database Management System
module "postgresql-dbms" {
  source                = "../postgresql-dbms"
  neon_project_location = var.neon_project_location
  project_id            = var.project_id
  neon_api_key          = var.neon_api_key
}

# PostgreSQL Database Branch Environment
module "postgresql-dbms-environment" {
  source           = "../postgresql-dbms-environment"
  environment_name = var.environment_name
  neon_project_id  = module.postgresql-dbms.neon_project_id
  neon_api_key     = var.neon_api_key
}

# Application Shell
module "core-platform-shell-browser-production" {
  source           = "../../../core/platform-shell-browser/iac/production" # The path to the module
  environment_name = "production"                                          # The deployment environment (branch-name, commit-hash, etc.)
  vercel_api_token = var.vercel_api_token                                  # The Vercel API token
}

# Documentation with Docusaurus
module "dx-dev-docs-browser-production" {
  source           = "../../../dx/dev-docs-browser/iac/production" # The path to the module
  environment_name = "production"                                  # The deployment environment (branch-name, commit-hash, etc.)
  vercel_api_token = var.vercel_api_token                          # The Vercel API token
}

# Peers Service

resource "neon_role" "researchers-peers-svc" {
  name       = "researchers-peers-svc"
  project_id = var.project_id
  branch_id  = module.postgresql-dbms-environment.branch_id
}

resource "neon_database" "researchers-peers-svc" {
  name       = "researchers-peers-svc"
  project_id = var.project_id
  branch_id  = module.postgresql-dbms-environment.branch_id
  owner_name = neon_role.researchers-peers-svc.name
}

locals {
  username             = neon_role.researchers-peers-svc.name
  password             = neon_role.researchers-peers-svc.password
  database_direct_host = module.postgresql-dbms-environment.branch_host
  direct_host_parts    = split(".", module.postgresql-dbms-environment.branch_host)
  database_pooler_host = join(".", [format("%s-pooler", local.direct_host_parts[0]), join(".", slice(local.direct_host_parts, 1, length(local.direct_host_parts)))])
  database_name        = neon_database.researchers-peers-svc.name

  database_direct_url = "postgres://${local.username}:${local.password}@${local.database_direct_host}/${local.database_name}"
  database_pooler_url = "postgres://${local.username}:${local.password}@${local.database_pooler_host}/${local.database_name}"
}

# module "researchers-peers-svc-rest-api-production" {
#   source                              = "../../../researchers/peers/svc-rest-api/iac" # The path to the module
#   environment                         = var.environment_name                          # The deployment environment (staging | production)
#   project_id                          = var.project_id                                # The Google Cloud project ID
#   region                              = var.region                                    # The region where resources will be created
#   database_url                        = local.database_pooler_url                     # The database URL connection string
#   direct_url                          = local.database_direct_url                     # The direct URL string
#   commit_hash                         = var.commit_hash                               # The commit hash of the source code to deploy
#   gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name       # The name of the Docker repository
# }
