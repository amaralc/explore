variable "app_name" {
  description = "The name of the application"
  type        = string
  default     = "researchers-peers"
}

variable "app_component_name" {
  description = "The name of the application component"
  type        = string
  default     = "svc-rest-api"
}

variable "environment" {
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

variable "database_name" {
  description = "The name of the database"
  type        = string
  sensitive   = true
}

variable "database_pooler_url" {
  description = "The database pooler URL connection string"
  type        = string
  sensitive   = true
}

variable "database_direct_url" {
  description = "The database direct URL connection string"
  type        = string
  sensitive   = true
}

variable "commit_hash" {
  description = "The commit hash of the source code to deploy"
  type        = string
}

variable "neon_project_id" {
  description = "The Neon Project ID"
  type        = string
  sensitive   = true
}

variable "neon_branch_id" {
  description = "The Neon branch id"
  type        = string
  sensitive   = true
}
