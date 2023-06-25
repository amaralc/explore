# Generate a random password for the SQL user
resource "random_password" "secret" {
  length  = 32
  special = false
}

# User
resource "google_sql_user" "instance" {
  name            = "${var.service_name}-${var.environment_name}"
  instance        = var.gcp_sql_dbms_instance_name
  password        = random_password.secret.result
  deletion_policy = "ABANDON" # https://registry.terraform.io/providers/hashicorp/google/3.49.0/docs/resources/sql_user#argument-reference
}

output "username" {
  value     = google_sql_user.instance.name
  sensitive = true
}

output "password" {
  value     = google_sql_user.instance.password
  sensitive = true
}
