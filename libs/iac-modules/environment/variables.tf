variable "support_account_email" {
  description = "The email of the account that will provide support"
  type        = string
  sensitive   = true
}

variable "owner_account_email" {
  description = "The email of the account that will own the resources"
  type        = string
  sensitive   = true
  default     = null
}

variable "creator_service_account_email" {
  description = "The email of the service account that will create the resources"
  type        = string
  sensitive   = true
  default     = null
}

variable "branch_name" {
  description = "The name of the branch"
  type        = string
}

variable "environment_name" {
  description = "The name of the environment"
  type        = string
  default     = null # Production environment has its own default value
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

variable "production_environment_core_platform_shell_browser_vite_vercel_project_id" {
  description = "The Vercel project ID of the core-platform-shell-browser-vite in the production environment"
  type        = string
  default     = null
}

variable "production_environment_marketing_institutional_website_vercel_project_id" {
  description = "The Vercel project ID of the marketing-institutional-website in the production environment"
  type        = string
  default     = null
}

variable "mongodb_atlas_org_id" {
  description = "The ID of the MongoDB Atlas organization"
  type        = string
  sensitive   = true
  default     = null
}



