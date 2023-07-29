variable "gcp_project_id" {
  description = "The ID of the Google Cloud project where resources will be created"
  type        = string
  sensitive   = true
}

variable "environment_name" {
  description = "The name of the environment"
  type        = string
  sensitive   = false
}

