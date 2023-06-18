resource "neon_branch" "postgresql-dbms-environment" {
  project_id = var.neon_project_id
  name       = var.environment_name
  parent_id  = var.neon_parent_branch_id
}
