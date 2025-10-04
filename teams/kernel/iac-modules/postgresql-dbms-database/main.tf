# Google Cloud Platform (GCP) Database Management System (DBMS)
resource "google_sql_database" "instance" {
  count           = var.dbms_provider.gcp != null ? 1 : 0
  project         = var.dbms_provider.gcp.project_id
  name            = var.name
  instance        = var.dbms_provider.gcp.dbms_instance_name
  deletion_policy = "ABANDON" #  The deletion policy for the database. Setting ABANDON allows the resource to be abandoned rather than deleted. This is useful for Postgres, where databases cannot be deleted from the API if there are users other than cloudsqlsuperuser with access. Possible values are: "ABANDON", "DELETE". Defaults to "DELETE".
}

# Neon PostgreSQL Database Management System (DBMS)
resource "neon_database" "instance" {
  count      = var.dbms_provider.neon != null ? 1 : 0
  name       = var.name
  project_id = var.dbms_provider.neon.project_id
  branch_id  = var.dbms_provider.neon.branch_id
  owner_name = var.dbms_provider.neon.owner_name
}

# Output
output "name" {
  value     = var.dbms_provider.gcp != null ? google_sql_database.instance[0].name : neon_database.instance[0].name
  sensitive = true
}
