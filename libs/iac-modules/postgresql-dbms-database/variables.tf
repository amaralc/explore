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
      owner_name = string
    }))
  })

  validation {
    condition     = (var.dbms_provider.gcp != null ? 1 : 0) + (var.dbms_provider.neon != null ? 1 : 0) == 1
    error_message = "Only one of the 'gcp' or 'neon' attributes should be provided."
  }
}

variable "name" {
  description = "The name of the database within the DBMS instance"
  type        = string
}
