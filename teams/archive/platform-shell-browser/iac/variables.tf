variable "is_production_environment" {
  description = "Whether this is a production environment or not"
  type        = bool
  default     = false
}

variable "is_service_enabled" {
  description = "Whether this service is enabled or not"
  type        = bool
  default     = true
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

