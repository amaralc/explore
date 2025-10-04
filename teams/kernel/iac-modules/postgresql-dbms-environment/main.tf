module "gcp" {
  source                          = "./gcp-postgresql-dbms-environment"
  count                           = var.dbms_provider.gcp != null ? 1 : 0
  environment_name                = var.environment_name
  gcp_project_id                  = var.dbms_provider.gcp.project_id
  gcp_location                    = var.dbms_provider.gcp.location
  gcp_network_id                  = var.dbms_provider.gcp.network_id
  gcp_private_vpc_connection_id   = var.dbms_provider.gcp.private_vpc_connection_id
  gcp_sql_dbms_source_instance_id = var.dbms_provider.gcp.sql_dbms_source_instance_id
  source_environment_branch_name  = var.source_environment_branch_name
}

module "neon" {
  source                = "./neon-postgresql-dbms-environment"
  count                 = var.dbms_provider.neon != null ? 1 : 0
  environment_name      = var.environment_name
  neon_project_id       = var.dbms_provider.neon.project_id
  neon_project_location = var.dbms_provider.neon.project_location
}

output "provider" {
  description = "The provider of the PostgreSQL database management system (DBMS) environment. (Neon: neon, GCP: gcp)"
  value       = var.dbms_provider.neon != null ? "neon" : "gcp"
}

output "id" {
  description = "The ID of the PostgreSQL database management system (DBMS) environment. (Neon: branch ID, GCP: sql instance ID)"
  value       = var.dbms_provider.neon != null ? module.neon[0].id : module.gcp[0].id
}

output "host" {
  description = "The host of the PostgreSQL database management system (DBMS) environment. (Neon: endpoint host, GCP: sql instance host)"
  value       = var.dbms_provider.neon != null ? module.neon[0].host : module.gcp[0].host
}

output "name" {
  description = "The name of the PostgreSQL database management system (DBMS) environment. (Neon: environment name, GCP: sql instance name)"
  value       = var.dbms_provider.neon != null ? module.neon[0].name : module.gcp[0].name
}

output "dbms_provider_project_id" {
  description = "The id of the project"
  value       = var.dbms_provider.neon != null ? module.neon[0].project_id : module.gcp[0].project_id
}

output "root_username" {
  description = "The username of the PostgreSQL database management system (DBMS) environment. (Neon: database username, GCP: sql instance username)"
  value       = var.dbms_provider.neon != null ? module.neon[0].root_username : module.gcp[0].root_username
}

output "root_password" {
  description = "The password of the PostgreSQL database management system (DBMS) environment. (Neon: database username, GCP: sql instance username)"
  value       = var.dbms_provider.neon != null ? module.neon[0].root_password : module.gcp[0].root_password
}
