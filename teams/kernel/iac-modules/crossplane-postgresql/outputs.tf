output "connection_secret_name" {
  description = "The name of the Kubernetes secret containing the database connection details"
  value       = local.connection_secret
}

output "database_name" {
  description = "The name of the provisioned database"
  value       = var.database_name
}

output "instance_name" {
  description = "The Crossplane claim instance name"
  value       = local.instance_name
}

output "db_credentials_secret_name" {
  description = "The name of the application-specific credentials secret (contains DB_URL)"
  value       = local.db_credentials_secret_name
}
