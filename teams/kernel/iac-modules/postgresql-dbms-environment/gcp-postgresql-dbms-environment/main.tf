locals {
  is_production_environment = var.source_environment_branch_name == null ? true : false
}

# Root
# Create a PostgreSQL database management system (DBMS) instance (root)
resource "google_sql_database_instance" "root_environment" {
  count               = local.is_production_environment == true ? 1 : 0 # Create root only if there is no source environment
  name                = substr("${var.gcp_project_id}-${var.environment_name}", 0, 63)
  database_version    = "POSTGRES_14"
  region              = var.gcp_location
  project             = var.gcp_project_id
  deletion_protection = false

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = var.gcp_network_id
      enable_private_path_for_google_cloud_services = true
    }
  }
}

# Create a PostgreSQL database management system (DBMS) instance (environment)
# Reference: https://cloud.google.com/sql/docs/mysql/clone-instance#terraform
resource "google_sql_database_instance" "preview_environment" {
  count               = local.is_production_environment == true ? 0 : 1 # Create environment only if there is a source environment
  name                = substr("${var.gcp_project_id}-${var.environment_name}", 0, 63)
  database_version    = "POSTGRES_14"
  region              = var.gcp_location
  project             = var.gcp_project_id
  deletion_protection = false

  clone {
    source_instance_name = var.gcp_sql_dbms_source_instance_id
  }

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = var.gcp_network_id
      enable_private_path_for_google_cloud_services = true
    }
  }
}

module "gcp_role" {
  source                     = "../../postgresql-dbms-user/gcp-postgresql-dbms-user"
  username                   = substr("${var.gcp_project_id}-${var.environment_name}", 0, 63)
  gcp_sql_dbms_instance_name = length(google_sql_database_instance.preview_environment) > 0 ? google_sql_database_instance.preview_environment[0].name : google_sql_database_instance.root_environment[0].name
  gcp_project_id             = var.gcp_project_id
}

output "host" {
  value     = local.is_production_environment == true ? google_sql_database_instance.root_environment[0].private_ip_address : google_sql_database_instance.preview_environment[0].private_ip_address
  sensitive = true
}

output "name" {
  value = local.is_production_environment == true ? google_sql_database_instance.root_environment[0].name : google_sql_database_instance.preview_environment[0].name
}

output "id" {
  value = local.is_production_environment == true ? google_sql_database_instance.root_environment[0].id : google_sql_database_instance.preview_environment[0].id
}

output "connection_name" {
  value = local.is_production_environment == true ? google_sql_database_instance.root_environment[0].connection_name : google_sql_database_instance.preview_environment[0].connection_name
}

output "project_id" {
  value = local.is_production_environment == true ? google_sql_database_instance.root_environment[0].project : google_sql_database_instance.preview_environment[0].project
}

output "root_username" {
  value       = module.gcp_role.username
  description = "The username of the PostgreSQL database management system (DBMS) environment. (Neon: database username, GCP: sql instance username)"
}

output "root_password" {
  value       = module.gcp_role.password
  description = "The password of the PostgreSQL database management system (DBMS) environment. (Neon: database password, GCP: sql instance password)"
}


