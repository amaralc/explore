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
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
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
