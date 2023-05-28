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

variable "database_url" {
  description = "The database URL connection string"
  type        = string
  sensitive   = true
}

variable "direct_url" {
  description = "The direct URL string"
  type        = string
  sensitive   = true
}

variable "commit_hash" {
  description = "The commit hash of the source code to deploy"
  type        = string
}
