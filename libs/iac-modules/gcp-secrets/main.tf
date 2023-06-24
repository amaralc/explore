# Create secrets
resource "google_secret_manager_secret" "secrets" {
  count = length(var.secrets)

  secret_id = var.secrets[count.index].name
  project   = var.gcp_project_id

  replication {
    automatic = true
  }
}

# Local variable created to explicitly type the output of the google_secret_manager_secret.secrets resource
locals {
  created_secrets = [for s in google_secret_manager_secret.secrets : {
    name = s.secret_id
    id   = s.id
  }]
}

# Create secrets versions
resource "google_secret_manager_secret_version" "versions" {
  count = length(var.secrets)

  secret      = local.created_secrets[count.index].id
  secret_data = var.secrets[count.index].value
}

# Output the created secrets ids
output "secret_ids" {
  description = "Array of created secret ids"
  value       = [for s in google_secret_manager_secret.secrets : { secret_id = s.secret_id }]
}

output "secrets_versions" {
  description = "Array of created secrets versions"
  value       = [for s in google_secret_manager_secret_version.versions : { version_id = s.id }]
}
