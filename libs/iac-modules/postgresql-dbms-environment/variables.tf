variable "dbms_provider" {
  description = "The provider configuration"
  type = object({
    gcp = optional(object({
      project_id                  = string
      location                    = string
      private_vpc_connection_id   = string
      network_id                  = string
      sql_dbms_source_instance_id = optional(string)
    }))
    neon = optional(object({
      project_id       = optional(string)
      project_location = string
    }))
  })

  validation {
    # One provider must be provided
    condition     = (var.dbms_provider.gcp != null ? 1 : 0) + (var.dbms_provider.neon != null ? 1 : 0) == 1
    error_message = "Only one of the 'gcp' or 'neon' attributes should be provided."
  }
}

variable "environment_name" {
  description = "The name of the environment"
  type        = string
}

variable "source_environment_branch_name" {
  description = "The name of the source environment branch"
  type        = string
  default     = null
}
