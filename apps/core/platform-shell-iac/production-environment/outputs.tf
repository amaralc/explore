# output "neon_project_id" {
#   description = "Neon project ID"
#   value       = neon_project.postgresql-dbms.id
# }

# output "neon_production_branch_id" {
#   description = "Neon production branch ID"
#   value       = neon_branch.postgresql-dbms-environment.id
# }

output "gcp_sql_database_instance_name" {
  description = "The name of the database instance"
  value       = google_sql_database_instance.postgresql-dbms.name
}
