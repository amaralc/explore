variable "service_name" {
  description = "The name of the service"
  type        = string
}

variable "environment_name" {
  description = "The deployment environment (branch-name, commit-hash, etc.)"
  type        = string
}

variable "gcp_sql_dbms_instance_name" {
  description = "The name of the Cloud SQL instance"
  type        = string
}
