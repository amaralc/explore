variable "branch_name" {
  description = "The name of the branch"
  type        = string
}

variable "environment_name" {
  description = "The name of the environment, calculated based on the branch name as -> environment_name=$(echo \"$branch_name\" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g'). In other words, it replaces all uppercase letters with lowercase letters, and replaces all non-alphanumeric characters with dashes."
  type        = string
}

variable "gcp_billing_account_id" {
  description = "The ID of the GCP billing account to associate this project with"
  type        = string
  sensitive   = true
  default     = null
}

variable "gcp_organization_id" {
  description = "The ID of the GCP organization where resources will be deployed"
  type        = string
  sensitive   = true
  default     = null
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_location" {
  description = "The GCP location"
  type        = string
}

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
  type        = string
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the Docker repository"
  type        = string
}

variable "source_environment_dbms_instance_id" {
  description = "The ID of the source DBMS, from which this DBMS will be copied"
  type        = string
  default     = null
}


variable "source_environment_branch_name" {
  description = "The name of the source environment branch" # Used by Vercel provider
  type        = string
  default     = null
}

variable "production_environment_core_platform_shell_browser_vercel_project_id" {
  description = "The Vercel project ID of the core-platform-shell-browser in the production environment"
  type        = string
  default     = null
}

variable "production_environment_core_root_shell_graph_vercel_project_id" {
  description = "The Vercel project ID of the core-root-shell-graph in the production environment"
  type        = string
  default     = null
}

variable "production_environment_dx_dev_docs_browser_vercel_project_id" {
  description = "The Vercel project ID of the dx-dev-docs-browser in the production environment"
  type        = string
  default     = null
}

