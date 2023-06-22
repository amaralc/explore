variable "gcp_project_id" {
  description = "The ID of the GCP project where resources will be deployed"
  type        = string
}

variable "gcp_region" {
  description = "A valid GCP region where resources will be deployed"
  type        = string
}

variable "repository_id" {
  description = "The id of the repository"
  type        = string
}

variable "repository_description" {
  description = "The description of the repository"
  type        = string
}

variable "repository_format" {
  description = "The format of the repository"
  type        = string
  default     = "DOCKER"
}
