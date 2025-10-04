variable "dbms_provider" {
  description = "The provider configuration"
  type = object({
    mongodb_atlas = optional(object({
      project_id                 = string
      instance_name              = string
      connection_string_protocol = string
      instance_type              = string
    }))
  })

  validation {
    condition     = (var.dbms_provider.mongodb_atlas != null ? 1 : 0) == 1
    error_message = "Currently only MongoDB Atlas is supported. Please provide the 'mongodb_atlas' attribute."
  }
  validation {
    condition     = var.dbms_provider.mongodb_atlas.instance_type == "CLUSTER" || var.dbms_provider.mongodb_atlas.instance_type == "SERVERLESS"
    error_message = "The value must be 'CLUSTER' or 'SERVERLESS'"
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
