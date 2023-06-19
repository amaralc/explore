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

output "gcp_sql_database_instance_connection_name" {
  description = "The name of the database instance"
  value       = google_sql_database_instance.postgresql-dbms.name
  sensitive   = true
}

output "connection_string" {
  description = "Connection string"
  value       = module.researchers-peers-svc.connection_string
  sensitive   = true
}

output "username" {
  description = "username"
  value       = module.researchers-peers-svc.username
}

output "password" {
  description = "password"
  value       = module.researchers-peers-svc.password
  sensitive   = true
}

output "database_name" {
  description = "database_name"
  value       = module.researchers-peers-svc.database_name
}

output "connection_name" {
  description = "connection_name"
  value       = google_sql_database_instance.postgresql-dbms.connection_name
  sensitive   = true
}
