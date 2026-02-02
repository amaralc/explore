variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_location" {
  description = "The Google Cloud project location (region)"
  type        = string
}

variable "environment_name" {
  description = "The deployment environment (branch-name, commit-hash, etc.)"
  type        = string
}

variable "provider_config_name" {
  description = "The Crossplane GCP ProviderConfig name"
  type        = string
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
