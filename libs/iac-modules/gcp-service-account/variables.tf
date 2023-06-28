variable "gcp_project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "is_production_environment" {
  description = "Whether this is a production environment"
  type        = bool
}

variable "environment_name" {
  description = "The name of the environment"
  type        = string

  validation {
    condition     = length(regexall("^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$", var.environment_name)) > 0
    error_message = "The name must be 1-63 characters long, start with a letter, end with a letter or digit, and only contain lowercase letters, digits or hyphens."
  }
}

variable "service_name" {
  description = "The name of the service"
  type        = string
}

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
  type        = string
}

