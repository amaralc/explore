variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

# variable "neon_branch_id" {
#   description = "Neon branch ID"
#   type        = string
# }

# variable "neon_branch_host" {
#   description = "Neon branch ID"
#   type        = string
# }

variable "environment_name" {
  description = "The preview environment unique name (e.g. branch-name, commit-hash, etc.)"
  type        = string
}

variable "gcp_location" {
  description = "The region where resources will be created"
  type        = string
}

variable "commit_hash" {
  description = "The commit hash of the source code to deploy"
  type        = string
}

# variable "gcp_docker_artifact_repository_name" {
#   description = "The name of the Docker repository"
#   type        = string
#   default     = "docker-repository"
# }

# variable "neon_api_key" {
#   description = "Neon API key"
#   type        = string
#   sensitive   = true
# }

variable "credentials_path" {
  description = "The path to the JSON key file for the Service Account Terraform will use to authenticate"
  type        = string
}

variable "gcp_sql_dbms_instance_name" {
  description = "The name of the dbms instance"
  type        = string
  sensitive   = true
}

# variable "gcp_sql_database_instance_connection_name" {
#   description = "The name of the database connection"
#   type        = string
#   sensitive   = true
# }

# variable "gcp_sql_database_instance_host" {
#   description = "The host of the database instance"
#   type        = string
#   sensitive   = true
# }

# variable "gcp_vpc_access_connector_name" {
#   description = "The name of the VPC access connector"
#   type        = string
# }
