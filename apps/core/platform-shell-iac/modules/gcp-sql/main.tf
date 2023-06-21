resource "random_id" "db_name_suffix" {
  byte_length = 4
}

resource "google_sql_database_instance" "postgresql-dbms" {
  name                = "${var.gcp_project_id}-${var.environment_name}-${random_id.db_name_suffix.hex}"
  database_version    = "POSTGRES_14"
  region              = var.gcp_location
  project             = var.gcp_project_id
  deletion_protection = false

  depends_on = [var.gcp_private_vpc_connection_id]

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = var.gcp_network_id
      enable_private_path_for_google_cloud_services = true
    }
  }
}
