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
