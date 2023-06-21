locals {
  environment_name = "production"
}

# Create the main Virtual Private Cloud (VPC)
module "vpc" {
  source               = "../gcp-vpc"
  environment_name     = local.environment_name
  gcp_project_id       = var.gcp_project_id
  gcp_project_location = var.gcp_location
}

# # Create the Cloud SQL instance
# module "gcp_sql" {
#   source                               = "../gcp-sql"
#   environment_name                     = local.environment_name
#   gcp_project_id                       = var.gcp_project_id
#   gcp_project_location                 = var.gcp_location
#   gcp_network_id                       = module.vpc.network_id
#   gcp_service_networking_connection_id = module.vpc.service_networking_connection_id
# }
