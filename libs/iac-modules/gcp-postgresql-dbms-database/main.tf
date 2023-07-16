# Database
resource "google_sql_database" "instance" {
  name            = var.database_name
  instance        = var.gcp_sql_dbms_instance_name
  deletion_policy = "ABANDON" # TODO -> Is this the best option?
}

output "name" {
  value     = google_sql_database.instance.name
  sensitive = true
}
