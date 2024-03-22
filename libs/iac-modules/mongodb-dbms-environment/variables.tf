variable "mongodb_atlas_org_id" {
  description = "The ID of the MongoDB Atlas organization"
  type        = string
  sensitive   = true
}

variable "environment_name" {
  description = "The name of the environment"
  type        = string
  sensitive   = false
}

variable "instance_name" {
  description = "The name of the instance"
  type        = string
  sensitive   = false
}

variable "mongodb_dbms_instance_type" {
  description = "The type of the MongoDB Atlas instance"
  type        = string

  validation {
    condition     = var.mongodb_dbms_instance_type == "CLUSTER" || var.mongodb_dbms_instance_type == "SERVERLESS"
    error_message = "The value must be 'CLUSTER' or 'SERVERLESS'"
  }
}

variable "mongodb_atlas_project_id" {
  description = "The ID of the MongoDB Atlas project"
  type        = string
  sensitive   = true
}



