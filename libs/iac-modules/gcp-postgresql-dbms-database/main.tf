# Database
resource "google_sql_database" "instance" {
  name            = var.database_name
  instance        = var.gcp_sql_dbms_instance_name
  deletion_policy = "ABANDON" #  The deletion policy for the database. Setting ABANDON allows the resource to be abandoned rather than deleted. This is useful for Postgres, where databases cannot be deleted from the API if there are users other than cloudsqlsuperuser with access. Possible values are: "ABANDON", "DELETE". Defaults to "DELETE".
}

output "name" {
  value     = google_sql_database.instance.name
  sensitive = true
}
