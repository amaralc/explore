variable "database_name" {
  description = "The name of the database (same of service name)"
  type        = string
}

variable "gcp_sql_dbms_instance_name" {
  description = "The name of the Cloud SQL instance"
  type        = string
}
