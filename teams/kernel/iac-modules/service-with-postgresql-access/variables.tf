variable "dbms_provider" {
  description = "The provider configuration"
  type = object({
    gcp = optional(object({
      project_id         = string
      dbms_instance_name = string
    }))
    neon = optional(object({
      project_id = string
      branch_id  = string
    }))
  })

  validation {
    condition     = (var.dbms_provider.gcp != null ? 1 : 0) + (var.dbms_provider.neon != null ? 1 : 0) == 1
    error_message = "Only one of the 'gcp' or 'neon' attributes should be provided."
  }
}

variable "dbms_instance_host" {
  description = "The host of the database instance"
  type        = string
  sensitive   = true
}

variable "service_name" {
  description = "The name of the service"
  type        = string
}

variable "database_name" {
  description = "The name of the database"
  type        = string
}

variable "source_environment_branch_name" {
  description = "The name of the source environment branch"
  type        = string
  default     = null
}

variable "environment_name" {
  description = "The preview environment unique name (e.g. branch-name, commit-hash, etc.)"
  type        = string
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
  type        = string
}
