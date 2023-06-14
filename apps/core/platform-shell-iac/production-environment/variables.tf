variable "environment_name" {
  description = "The preview environment unique name (e.g. branch-name, commit-hash, etc.)"
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

# variable "credentials_path" {
#   description = "The path to the JSON key file for the Service Account Terraform will use to authenticate"
#   type        = string
#   default     = "credentials.json"
# }

# variable "database_url" {
#   description = "The database URL connection string"
#   type        = string
#   sensitive   = true
# }

# variable "direct_url" {
#   description = "The direct URL string"
#   type        = string
#   sensitive   = true
# }

variable "commit_hash" {
  description = "The commit hash of the source code to deploy"
  type        = string
}

variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the Docker repository"
  type        = string
  default     = "docker-repository"
}

variable "neon_api_key" {
  description = "Neon API key"
  type        = string
  sensitive   = true
}

variable "neon_project_location" {
  description = "The Neon project region"
  type        = string
}

variable "credentials_path" {
  description = "The path to the JSON key file for the Service Account Terraform will use to authenticate"
  type        = string
  default     = "credentials.json"
}
