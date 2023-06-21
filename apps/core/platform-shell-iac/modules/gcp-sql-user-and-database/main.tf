# Generate a random password for the SQL user
resource "random_password" "secret" {
  length  = 32
  special = false
}

# User
resource "google_sql_user" "user" {
  name     = var.service_name
  instance = var.gcp_sql_dbms_instance_name
  password = random_password.secret.result
  # deletion_policy = "ABANDON" # https://registry.terraform.io/providers/hashicorp/google/3.49.0/docs/resources/sql_user#argument-reference
}

# Database
resource "google_sql_database" "database" {
  name     = var.service_name
  instance = var.gcp_sql_dbms_instance_name
}
