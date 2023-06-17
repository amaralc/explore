# PostgreSQL Database Branch Environment
module "postgresql-dbms-environment" {
  source           = "../postgresql-dbms-environment"
  environment_name = var.environment_name
  neon_project_id  = var.neon_project_id
  neon_api_key     = var.neon_api_key
}

# Researchers Peers Service
module "researchers-peers-svc" {
  source                              = "../../../researchers/peers/svc-iac"
  commit_hash                         = var.commit_hash
  environment_name                    = var.environment_name
  region                              = var.region
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  neon_branch_host                    = module.postgresql-dbms-environment.branch_host
  neon_branch_id                      = module.postgresql-dbms-environment.branch_id
  project_id                          = var.project_id
  neon_api_key                        = var.neon_api_key
  credentials_path                    = var.credentials_path
}

# # Application Shell
# module "core-platform-shell-browser" {
#   source           = "../../../core/platform-shell-browser/iac/production" # The path to the module
#   environment_name = var.environment_name                                  # The deployment environment (branch-name, commit-hash, etc.)
#   vercel_api_token = var.vercel_api_token                                  # The Vercel API token
#   # depends_on       = [module.researchers-peers-svc]
# }

# # Documentation with Docusaurus
# module "dx-dev-docs-browser" {
#   source           = "../../../dx/dev-docs-browser/iac/production" # The path to the module
#   environment_name = var.environment_name                          # The deployment environment (branch-name, commit-hash, etc.)
#   vercel_api_token = var.vercel_api_token                          # The Vercel API token
#   # depends_on       = [module.researchers-peers-svc]
# }

