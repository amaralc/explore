# Peers Service
resource "neon_role" "researchers-peers-svc" {
  name       = "researchers-peers-svc"
  project_id = var.project_id
  branch_id  = var.neon_branch_id
}

resource "neon_database" "researchers-peers-svc" {
  name       = "researchers-peers-svc"
  project_id = var.project_id
  branch_id  = var.neon_branch_id
  owner_name = neon_role.researchers-peers-svc.name
}

locals {
  username             = neon_role.researchers-peers-svc.name
  password             = neon_role.researchers-peers-svc.password
  database_direct_host = var.neon_branch_host
  direct_host_parts    = split(".", local.database_direct_host)
  database_pooler_host = join(".", [format("%s-pooler", local.direct_host_parts[0]), join(".", slice(local.direct_host_parts, 1, length(local.direct_host_parts)))])
  database_name        = neon_database.researchers-peers-svc.name

  database_direct_url = "postgres://${local.username}:${local.password}@${local.database_direct_host}/${local.database_name}"
  database_pooler_url = "postgres://${local.username}:${local.password}@${local.database_pooler_host}/${local.database_name}"
}

module "researchers-peers-svc-rest-api-production" {
  source                              = "../svc-rest-api/iac"                   # The path to the module
  environment                         = var.environment_name                    # The deployment environment (staging | production)
  project_id                          = var.project_id                          # The Google Cloud project ID
  region                              = var.region                              # The region where resources will be created
  database_pooler_url                 = local.database_pooler_url               # The database URL connection string
  database_direct_url                 = local.database_direct_url               # The direct URL string
  commit_hash                         = var.commit_hash                         # The commit hash of the source code to deploy
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name # The name of the Docker repository
  credentials_path                    = var.credentials_path
}
