locals {
  is_production_environment = var.source_environment_branch_name == null ? true : false
}

output "branch_name" {
  value = var.branch_name
}

# Create the main Virtual Private Cloud (VPC)
module "vpc" {
  source           = "../gcp-vpc"
  environment_name = var.environment_name
  gcp_project_id   = var.gcp_project_id
  gcp_location     = var.gcp_location
}

output "vpc" {
  value = module.vpc
}

# Create a PostgreSQL database management system (DBMS) instance clone for the preview environment
module "postgresql_dbms" {
  source                          = "../gcp-postgresql-dbms-environment"
  environment_name                = var.environment_name
  gcp_project_id                  = var.gcp_project_id
  gcp_location                    = var.gcp_location
  gcp_network_id                  = module.vpc.private_network.id
  gcp_private_vpc_connection_id   = module.vpc.private_vpc_connection.id
  gcp_sql_dbms_source_instance_id = var.source_environment_dbms_instance_id
  source_environment_branch_name  = var.source_environment_branch_name
  depends_on                      = [module.vpc]
}

output "postgresql_dbms_instance_id" {
  value = module.postgresql_dbms.gcp_sql_dbms_instance_id
}

# Researchers Peers Microservice
module "researchers-peers" {
  source                              = "../../../apps/researchers/peers/svc-iac"
  source_environment_branch_name      = var.source_environment_branch_name # Informs the type of environment in order to decide how to treat database and users
  environment_name                    = var.environment_name
  gcp_project_id                      = var.gcp_project_id
  gcp_location                        = var.gcp_location
  short_commit_sha                    = var.short_commit_sha
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  gcp_sql_dbms_instance_host          = module.postgresql_dbms.gcp_sql_dbms_instance_host
  gcp_sql_dbms_instance_name          = module.postgresql_dbms.gcp_sql_dbms_instance_name
  gcp_vpc_access_connector_name       = module.vpc.gcp_vpc_access_connector_name # Necessary to stablish connection with database
  depends_on                          = [module.postgresql_dbms]
}

# # Application Shell
# module "core-platform-shell-browser" {
#   source                        = "../../../apps/core/platform-shell-browser/iac" # The path to the module
#   branch_name                   = var.branch_name                                 # The name of the branch
#   is_production_environment     = local.is_production_environment
#   source_environment_project_id = var.production_environment_core_platform_shell_browser_vercel_project_id
#   depends_on                    = [module.researchers-peers]
# }

# output "core_platform_shell_browser_vercel_project_id" {
#   value = module.core-platform-shell-browser.vercel_project_id
# }

module "core-platform-shell-browser" {
  source                           = "../environment-vercel"
  project_name                     = "core-platform-shell-browser"
  framework                        = "nextjs"
  git_provider                     = "github"
  username_and_repository          = "amaralc/peerlab"
  branch_name                      = var.branch_name
  is_production_environment        = local.is_production_environment
  install_command                  = local.is_production_environment ? "yarn install" : null
  build_command                    = local.is_production_environment ? "npx nx build core-platform-shell-browser --prod" : null
  output_directory                 = local.is_production_environment ? "dist/apps/core/platform-shell-browser/.next" : null
  ignore_command                   = local.is_production_environment ? "if [ $VERCEL_ENV == 'production' ]; then exit 1; else exit 0; fi" : null
  preview_environment_variables    = local.is_production_environment ? null : null # Map of string key and values
  production_environment_variables = local.is_production_environment ? null : null # Set of objects with key, value and target (production, preview, development)
  source_environment_project_id    = var.production_environment_core_platform_shell_browser_vercel_project_id

  depends_on = [module.researchers-peers]
}

output "core_platform_shell_browser_vercel_project_id" {
  value = local.is_production_environment ? module.core-platform-shell-browser.vercel_project_id : null
}

# # Application Shell
# module "core-platform-shell-browser" {
#   source           = "../../../apps/core/platform-shell-browser/iac/production" # The path to the module
#   environment_name = var.branch_name                                            # The name of the branch
#   depends_on       = [module.researchers-peers]
# }

# # Documentation with Docusaurus
# module "dx-dev-docs-browser" {
#   source           = "../../../apps/dx/dev-docs-browser/iac/production" # The path to the module
#   environment_name = var.branch_name                                    # The name of the branch
#   depends_on       = [module.researchers-peers]
# }

# # Nx Graph
# module "core-root-shell-graph" {
#   source           = "../../../apps/core/root-shell-graph/iac/production" # The path to the module
#   environment_name = var.branch_name                                      # The name of the branch
# }
