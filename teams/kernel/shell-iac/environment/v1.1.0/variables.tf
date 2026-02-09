# =============================================================================
# Environment type selector
# =============================================================================

variable "environment_type" {
  description = "The type of environment to provision: local, preview, or production"
  type        = string

  validation {
    condition     = contains(["local", "preview", "production"], var.environment_type)
    error_message = "environment_type must be one of: local, preview, production."
  }
}

# =============================================================================
# Common variables (used by both paths)
# =============================================================================

variable "domain_name" {
  description = "The domain name"
  type        = string
}

variable "environment_name" {
  description = "The name of the environment"
  type        = string
  default     = null
}

variable "branch_name" {
  description = "The name of the branch"
  type        = string
  default     = null
}

# =============================================================================
# Cloud-only variables (nullable -- ignored when environment_type == "local")
# =============================================================================

variable "support_account_email" {
  description = "The email of the account that will provide support"
  type        = string
  sensitive   = true
  default     = null
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

variable "gcp_shell_project_id" {
  description = "The shell Google Cloud project ID"
  type        = string
  default     = null
}

variable "gcp_location" {
  description = "The GCP location"
  type        = string
  default     = null
}

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
  type        = string
  default     = null
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the Docker repository"
  type        = string
  default     = null
}

variable "source_environment_dbms_instance_id" {
  description = "The ID of the source DBMS, from which this DBMS will be copied"
  type        = string
  default     = null
}

variable "source_environment_branch_name" {
  description = "The name of the source environment branch"
  type        = string
  default     = null
}

variable "production_environment_core_root_shell_graph_vercel_project_id" {
  description = "The Vercel project ID of the kernel-system-graph-browser in the production environment"
  type        = string
  default     = null
}

variable "production_environment_dx_dev_docs_browser_vercel_project_id" {
  description = "The Vercel project ID of the kernel-dev-docs-browser in the production environment"
  type        = string
  default     = null
}

variable "production_environment_core_platform_shell_browser_vite_vercel_project_id" {
  description = "The Vercel project ID of the core-platform-shell-browser-vite in the production environment"
  type        = string
  default     = null
}

variable "production_environment_core_platform_shell_browser_vercel_project_id" {
  description = "The Vercel project ID of the core-platform-shell-browser in the production environment"
  type        = string
  default     = null
}

variable "mongodb_atlas_org_id" {
  description = "The ID of the MongoDB Atlas organization"
  type        = string
  sensitive   = true
  default     = null
}

variable "nx_cloud_access_token" {
  description = "The NX Cloud access token"
  type        = string
  sensitive   = true
  default     = null
}

variable "neon_project_location" {
  type        = string
  description = "The location of the Neon project"
  default     = null
}

variable "gcp_dns_managed_zone_name" {
  description = "The name of the DNS managed zone"
  type        = string
  default     = null
}

variable "environment_path" {
  description = "The path to the environment"
  type        = string
  default     = null
}

# =============================================================================
# Local-only variables (ignored when environment_type != "local")
# =============================================================================

variable "minikube_profile" {
  description = "The minikube profile name for the local cluster"
  type        = string
  default     = "peerlab-iam"
}

variable "minikube_memory" {
  description = "Memory allocation for minikube in MB"
  type        = number
  default     = 4096
}

variable "minikube_cpus" {
  description = "CPU allocation for minikube"
  type        = number
  default     = 2
}

variable "crossplane_version" {
  description = "The Crossplane Helm chart version"
  type        = string
  default     = "2.1.4"
}
