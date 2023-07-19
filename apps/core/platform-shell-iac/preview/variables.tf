variable "owner_account_email" {
  description = "The email of the account that will own the resources"
  type        = string
  sensitive   = true
  default     = null
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
}

variable "gcp_project_id" {
  description = "The ID of the GCP project where resources will be deployed"
  type        = string
  sensitive   = true
}

variable "gcp_location" {
  description = "A valid GCP location where resources will be deployed"
  type        = string
  sensitive   = true
}
variable "gcp_credentials_file_path" {
  description = "The path to the JSON key file for the Service Account Terraform will use to authenticate"
  type        = string
  sensitive   = true
  default     = "credentials.json"
}

variable "core_platform_shell_browser_vite_vercel_project_id" {
  description = "The Vercel project ID of the core-platform-shell-browser in the production environment"
  type        = string
  default     = null
}

variable "core_root_shell_graph_vercel_project_id" {
  description = "The Vercel project ID of the core-root-shell-graph in the production environment"
  type        = string
  default     = null
}

variable "dx_dev_docs_browser_vercel_project_id" {
  description = "The Vercel project ID of the dx-dev-docs-browser in the production environment"
  type        = string
  default     = null
}

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
  type        = string
}

variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the Docker repository"
  type        = string
  default     = "docker-repository"
}

variable "branch_name" {
  description = "The name of the branch to deploy an environment from"
  type        = string
}
