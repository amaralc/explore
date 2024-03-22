variable "is_production_environment" {
  description = "Whether this is a production environment or not"
  type        = bool
  default     = false
}

variable "source_environment_project_id" {
  description = "The vercel project id. Required for preview environments"
  type        = string
  default     = null
}

variable "branch_name" {
  description = "The branch name whe the deployment is being created from"
  type        = string
  default     = null
}

variable "gcp_project_id" {
  description = "The GCP project id"
  type        = string
  sensitive   = true
}

variable "gcp_shell_project_id" {
  description = "The GCP shell project id"
  type        = string
  sensitive   = true
}


variable "environment_name" {
  description = "The GCP environment name"
  type        = string
  sensitive   = true
}

variable "gcp_location" {
  description = "The GCP location"
  type        = string
  sensitive   = true
}

variable "gcp_docker_artifact_repository_name" {
  description = "The GCP artifact repository name"
  type        = string
  sensitive   = true
}

variable "short_commit_sha" {
  description = "The short commit sha"
  type        = string
}

variable "source_environment_branch_name" {
  description = "The source environment branch name"
  type        = string
  default     = null
}

variable "service_name" {
  description = "The name of the service (it will also be used as the name of the docker image)"
  type        = string
}

variable "gcp_dns_managed_zone_name" {
  description = "The GCP DNS managed zone name"
  type        = string
}

variable "environment_variables" {
  description = "The environment variables"
  type        = map(string)
  default     = {}
}

variable "domain_name" {
  description = "The domain name"
  type        = string
}


