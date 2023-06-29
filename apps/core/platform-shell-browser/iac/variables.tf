variable "branch_name" {
  description = "Name of the branch"
  type        = string
}

variable "is_production_environment" {
  description = "Whether this is the production environment"
  type        = bool
  default     = false
}

variable "source_environment_project_id" {
  description = "The vercel project ID of the project"
  type        = string
  default     = null
}
