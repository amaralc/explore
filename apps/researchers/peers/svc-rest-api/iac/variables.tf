variable "app_name" {
  description = "The name of the application"
  type        = string
}

variable "app_component_name" {
  description = "The name of the application component"
  type        = string
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

variable "credentials_path" {
  description = "The path to the JSON key file for the Service Account Terraform will use to authenticate"
  type        = string
  default     = "credentials.json"
}
