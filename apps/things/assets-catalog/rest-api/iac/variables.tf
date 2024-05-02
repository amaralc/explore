variable "is_production_environment" {
  description = "Whether this is a production environment or not"
  type        = bool
  default     = false
}

variable "service_component_name" {
  description = "The name of the service component. Usually the same as the Nx project name, it will be used to name the Docker image and the Cloud Run service"
  type        = string
}

variable "environment_name" {
  description = "Environment name (staging | production)"
  type        = string
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_shell_project_id" {
  description = "The shell Google Cloud project ID"
  type        = string
}

variable "gcp_location" {
  description = "The region where resources will be created"
  type        = string
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the Docker repository"
  type        = string
}

variable "short_commit_sha" {
  description = "The commit hash of the source code to deploy"
  type        = string
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

variable "domain_name" {
  description = "The domain name"
  type        = string
}

variable "gcp_dns_managed_zone_name" {
  description = "The GCP DNS managed zone name"
  type        = string
}

# variable "gcp_pooled_database_connection_url_secret_id" {
#   description = "The ID of the secret for the pooled database connection url"
#   type        = string
# }

# variable "gcp_pooled_database_connection_url_secret_version" {
#   description = "A version of the secret for the pooled database connection url"
#   type        = string
# }

# variable "gcp_vpc_access_connector_name" {
#   description = "The name of the VPC access connector"
#   type        = string
# }
