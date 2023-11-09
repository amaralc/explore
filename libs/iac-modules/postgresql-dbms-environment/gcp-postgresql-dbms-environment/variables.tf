variable "environment_name" {
  description = "The deployment environment (branch-name, commit-hash, etc.)"
  type        = string
}

variable "source_environment_branch_name" {
  description = "The name of the source environment branch" # Used by Vercel provider
  type        = string
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

variable "gcp_network_id" {
  description = "The GCP network ID"
  type        = string
}

variable "gcp_private_vpc_connection_id" {
  description = "The GCP service networking connection ID"
  type        = string
}

variable "gcp_sql_dbms_source_instance_id" {
  description = "The GCP SQL DBMS source instance ID"
  type        = string
  default     = null
}



