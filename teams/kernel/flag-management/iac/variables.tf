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

variable "gcp_vpc_access_connector_id" {
  description = "The id of the VPC access connector"
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

variable "dbms_instance_host" {
  description = "The host of the database instance"
  type        = string
  sensitive   = true
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_shell_project_id" {
  description = "The Google Cloud project ID used to build images"
  type        = string
}

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
  type        = string
}

variable "gcp_location" {
  description = "The region where resources will be created"
  type        = string
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the Docker repository"
  type        = string
}

variable "branch_name" {
  description = "The name of the branch that triggered the Terraform run"
  type        = string
}

# variable "gcp_cloudbuildv2_repository_id" {
#   description = "The ID of the Cloud Build V2 repository"
#   type        = string
# }

variable "nx_cloud_access_token" {
  description = "The NX Cloud access token"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "The domain name"
  type        = string
}

variable "gcp_dns_managed_zone_name" {
  description = "The GCP DNS managed zone name"
  type        = string
}

variable "service_name" {
  description = "The name of the service"
  type        = string
}

variable "environment_path" {
  description = "The path to the environment"
  type        = string
}
