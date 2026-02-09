variable "composition_name" {
  description = "Which Composition to apply and reference in the claim (postgresql-cloudsql or postgresql-local)"
  type        = string
  default     = "postgresql-cloudsql"

  validation {
    condition     = contains(["postgresql-cloudsql", "postgresql-local"], var.composition_name)
    error_message = "composition_name must be either 'postgresql-cloudsql' or 'postgresql-local'."
  }
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID (not needed for local composition)"
  type        = string
  default     = ""
}

variable "gcp_location" {
  description = "The Google Cloud project location (region), or 'local' for minikube"
  type        = string
}

variable "environment_name" {
  description = "The deployment environment (branch-name, commit-hash, etc.)"
  type        = string
  default     = "local"
}

variable "provider_config_name" {
  description = "The Crossplane GCP ProviderConfig name (not needed for local composition)"
  type        = string
  default     = ""
}

variable "database_name" {
  description = "The name of the PostgreSQL database to create"
  type        = string
}

variable "namespace" {
  description = "The Kubernetes namespace for the claim and connection secret"
  type        = string
}

variable "postgresql_version" {
  description = "The PostgreSQL version (e.g., POSTGRES_17, POSTGRES_16)"
  type        = string
  default     = "POSTGRES_17"
}

variable "storage_gb" {
  description = "The storage size in GB for the database instance"
  type        = number
  default     = 10
}

variable "tier" {
  description = "The Cloud SQL machine tier"
  type        = string
  default     = "db-f1-micro"
}

variable "local_pg_username" {
  description = "PostgreSQL username for the local composition (ignored for cloud)"
  type        = string
  default     = "logto"
}

variable "local_pg_password" {
  description = "PostgreSQL password for the local composition (ignored for cloud)"
  type        = string
  default     = "local-dev-only"
  sensitive   = true
}

variable "kubeconfig_context" {
  description = "The kubectl context for local-exec commands (must match the target cluster)"
  type        = string
  default     = ""

  validation {
    condition     = can(regex("^[a-zA-Z0-9._@/-]*$", var.kubeconfig_context))
    error_message = "kubeconfig_context must contain only alphanumeric characters, dots, underscores, @, slashes, and hyphens."
  }
}
