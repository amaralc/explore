resource "neon_branch" "postgresql-dbms-environment" {
  project_id = var.neon_project_id
  name       = var.environment_name
}
