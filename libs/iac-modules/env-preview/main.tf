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

# Create a PostgreSQL database management system (DBMS) instance clone for the preview environment
module "postgresql_dbms" {
  source                          = "../gcp-postgresql-dbms-clone"
  environment_name                = local.environment_name
  gcp_project_id                  = var.gcp_project_id
  gcp_location                    = var.gcp_location
  gcp_network_id                  = module.vpc.private_network.id
  gcp_private_vpc_connection_id   = module.vpc.private_vpc_connection.id
  gcp_sql_dbms_source_instance_id = var.source_environment_dbms_instance_id
  depends_on                      = [module.vpc]
}
