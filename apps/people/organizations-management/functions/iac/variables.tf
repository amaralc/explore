variable "gcp_location" {
  description = "The region where resources will be created"
  type        = string
}

variable "service_component_name" {
  description = "The name of the service component"
  type        = string
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_direct_database_connection_url_secret_id" {
  description = "The ID of the secret for the direct database connection url"
  type        = string
  sensitive   = true
}

variable "gcp_service_account_email" {
  description = "The email of the GCP Service Account"
  type        = string
  sensitive   = true
}

variable "short_commit_sha" {
  description = "The commit hash of the source code to deploy"
  type        = string
}
