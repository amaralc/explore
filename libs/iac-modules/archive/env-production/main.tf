output "branch_name" {
  value = var.branch_name
}

# Parse branch name to environment name
data "external" "bash" {
  program = ["bash", "-c", "branch_name='${var.branch_name}'; environment_name=$(echo \"$branch_name\" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g'); echo \"{\\\"environment_name\\\": \\\"$environment_name\\\"}\""]
}

locals {
  environment_name = data.external.bash.result["environment_name"]
}

# Create the main Virtual Private Cloud (VPC)
module "vpc" {
  source           = "../gcp-vpc"
  environment_name = local.environment_name
  gcp_project_id   = var.gcp_project_id
  gcp_location     = var.gcp_location
}

output "vpc" {
  value = module.vpc
}

# Create a PostgreSQL database management system (DBMS) instance for the production environment
module "postgresql_dbms" {
  source                        = "../gcp-postgresql-dbms"
  environment_name              = local.environment_name
  gcp_project_id                = var.gcp_project_id
  gcp_location                  = var.gcp_location
  gcp_network_id                = module.vpc.private_network.id
  gcp_private_vpc_connection_id = module.vpc.private_vpc_connection.id
  depends_on                    = [module.vpc]
}

output "postgresql_dbms" {
  value = module.postgresql_dbms
}

# Researchers Peers Microservice
module "researchers-peers" {
  source                              = "../../../apps/researchers/peers/svc-iac"
  environment_name                    = local.environment_name
  gcp_project_id                      = var.gcp_project_id
  gcp_location                        = var.gcp_location
  short_commit_sha                    = var.short_commit_sha
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  gcp_sql_dbms_instance_host          = module.postgresql_dbms.google_sql_database_instance.private_ip_address
  gcp_sql_dbms_instance_name          = module.postgresql_dbms.google_sql_database_instance.name
  gcp_vpc_access_connector_name       = module.vpc.gcp_vpc_access_connector_name # Necessary to stablish connection with database
  depends_on                          = [module.postgresql_dbms]
}

# Application Shell
module "core-platform-shell-browser" {
  source           = "../../../apps/core/platform-shell-browser/iac/production" # The path to the module
  environment_name = var.branch_name                                            # The name of the branch
  depends_on       = [module.researchers-peers]
}

# Documentation with Docusaurus
module "dx-dev-docs-browser" {
  source           = "../../../apps/dx/dev-docs-browser/iac/production" # The path to the module
  environment_name = var.branch_name                                    # The name of the branch
  depends_on       = [module.researchers-peers]
}

# Nx Graph
module "core-root-shell-graph" {
  source           = "../../../apps/core/root-shell-graph/iac/production" # The path to the module
  environment_name = var.branch_name                                      # The name of the branch
}

# # Researchers Peers Microservice
# module "researchers-peers-svc" {
#   source                     = "../../../../researchers/peers/svc-iac"
#   environment_name           = local.environment_name # The deployment environment (branch-name, commit-hash, etc.)
#   short_commit_sha           = var.short_commit_sha   # Forces creation of new instance with latest image
#   gcp_location               = var.gcp_location       # Location where resources will be created
#   gcp_project_id             = var.gcp_project_id     # The Google Cloud project ID
#   gcp_sql_dbms_instance_name = module.postgresql_dbms.google_sql_database_instance.name
#   # gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name # Artifact repository name

#   depends_on = [module.postgresql_dbms, module.vpc]

#   # gcp_sql_database_instance_name            = google_sql_database_instance.postgresql-dbms.name
#   # gcp_sql_database_instance_connection_name = google_sql_database_instance.postgresql-dbms.connection_name
#   # gcp_sql_database_instance_host            = google_sql_database_instance.postgresql-dbms.private_ip_address
#   # gcp_vpc_access_connector_name             = google_vpc_access_connector.connector.name

#   # neon_branch_host                    = module.postgresql-dbms-environment.branch_host
#   # neon_branch_id                      = module.postgresql-dbms-environment.branch_id
#   # neon_api_key                        = var.neon_api_key
# }
