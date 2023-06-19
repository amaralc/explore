variable "app_name" {
  description = "The name of the application"
  type        = string
}

variable "app_component_name" {
  description = "The name of the application component"
  type        = string
}

variable "environment_name" {
  description = "Environment name (staging | production)"
  type        = string
}

variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "The region where resources will be created"
  type        = string
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the Docker repository"
  type        = string
}

variable "commit_hash" {
  description = "The commit hash of the source code to deploy"
  type        = string
}

variable "credentials_path" {
  description = "The path to the JSON key file for the Service Account Terraform will use to authenticate"
  type        = string
  default     = "credentials.json"
}

variable "gcp_service_account_email" {
  description = "The email of the GCP Service Account"
  type        = string
  sensitive   = true
}

variable "gcp_direct_database_connection_url_secret_id" {
  description = "The ID of the secret for the direct database connection url"
  type        = string
}

variable "gcp_direct_database_connection_url_secret_version" {
  description = "A version of the secret for the direct database connection url"
  type        = string
}

variable "gcp_pooled_database_connection_url_secret_id" {
  description = "The ID of the secret for the pooled database connection url"
  type        = string
}

variable "gcp_pooled_database_connection_url_secret_version" {
  description = "A version of the secret for the pooled database connection url"
  type        = string
}

variable "gcp_sql_database_instance_connection_name" {
  description = "The name of the Cloud SQL connection"
  type        = string
  sensitive   = true
}

variable "gcp_sql_database_instance_name" {
  description = "The name of the Cloud SQL instance"
  type        = string
  sensitive   = true
}

variable "database_direct_url" {
  description = "The direct database connection URL"
  type        = string
}

variable "database_pooler_url" {
  description = "The pooled database connection URL"
  type        = string
}
