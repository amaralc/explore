# Create a PostgreSQL database management system (DBMS) instance (environment)
# Reference: https://cloud.google.com/sql/docs/mysql/clone-instance#terraform
resource "google_sql_database_instance" "environment" {
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

  depends_on = [var.gcp_private_vpc_connection_id]
}

output "google_sql_database_instance" {
  value     = google_sql_database_instance.environment
  sensitive = true
}

