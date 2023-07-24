variable "service_name" {
  description = "The name of the service"
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

variable "gcp_sql_dbms_instance_name" {
  description = "The name of the dbms instance"
  type        = string
  sensitive   = true
}

variable "gcp_sql_dbms_instance_host" {
  description = "The host of the database instance"
  type        = string
  sensitive   = true
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
  type        = string
}

variable "gcp_sql_dbms_instance_connection_name" {
  description = "The connection name of the Cloud SQL DBMS instance"
  type        = string
}
