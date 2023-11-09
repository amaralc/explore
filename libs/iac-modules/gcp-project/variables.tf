variable "owner_account_email" {
  description = "The email of the account that will own the resources"
  type        = string
  sensitive   = true
}
variable "creator_service_account_email" {
  description = "The email of the service account that will create the resources"
  type        = string
  sensitive   = true
}

variable "is_production_environment" {
  description = "Whether the environment is a production environment"
  type        = bool
  default     = false
}

variable "environment_name" {
  description = "The name of the environment"
  type        = string

  validation {
    condition     = length(var.environment_name) <= 23
    error_message = "The environment name must be 23 characters or less." # Network resources have a 23 character limit
  }
}

variable "gcp_shell_project_id" {
  description = "The shell Google Cloud project ID"
  type        = string
}

variable "gcp_billing_account_id" {
  description = "The Google Cloud billing account ID"
  type        = string
  sensitive   = true
}

variable "gcp_organization_id" {
  description = "The Google Cloud organization ID"
  type        = string
  sensitive   = true
}

variable "apis" {
  description = "The list of APIs to enable"
  type        = list(string)
}
