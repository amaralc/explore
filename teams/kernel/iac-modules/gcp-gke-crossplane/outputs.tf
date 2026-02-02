output "crossplane_service_account_email" {
  description = "The email of the Crossplane GCP service account"
  value       = google_service_account.crossplane.email
}

output "crossplane_namespace" {
  description = "The Kubernetes namespace where Crossplane is installed"
  value       = local.crossplane_namespace
}

output "provider_config_name" {
  description = "The name of the Crossplane GCP ProviderConfig"
  value       = local.provider_config_name
}
