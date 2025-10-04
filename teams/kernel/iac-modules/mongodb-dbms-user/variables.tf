variable "username" {
  description = "The username of the DBMS user"
  type        = string
}

variable "mongodb_project_id" {
  description = "The project ID of the MongoDB Atlas project"
  type        = string
}

variable "database_name" {
  description = "The name of the database"
  type        = string
}

variable "environment_name" {
  description = "The name of the environment"
  type        = string
}

variable "monbodb_dbms_instance_name" {
  description = "The name of the MongoDB Atlas instance"
  type        = string
}

variable "mongodb_dbms_instance_type" {
  description = "The type of the MongoDB Atlas instance"
  type        = string

  validation {
    condition     = var.mongodb_dbms_instance_type == "CLUSTER" || var.mongodb_dbms_instance_type == "SERVERLESS"
    error_message = "The value must be 'CLUSTER' or 'SERVERLESS'"
  }
}
