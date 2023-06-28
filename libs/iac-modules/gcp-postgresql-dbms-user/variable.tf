variable "username" {
  description = "The database username for the service"
  type        = string
  validation {
    condition     = length(regexall("^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$", var.username)) > 0
    error_message = "The name must be 1-63 characters long, start with a letter, end with a letter or digit, and only contain lowercase letters, digits or hyphens."
  }
}

variable "gcp_sql_dbms_instance_name" {
  description = "The name of the Cloud SQL instance"
  type        = string
}
