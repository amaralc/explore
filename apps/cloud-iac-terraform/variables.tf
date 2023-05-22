# Define the variables that will be used within the configuration
variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "The region where resources will be created"
  type        = string

}
variable "repo_owner" {
  description = "The GitHub owner's username"
  type        = string
  default     = "amaralc"
}
variable "repo_name" {
  description = "The name of the source repository"
  type        = string
  default     = "peerlab"
}

variable "credentials_path" {
  description = "The path to the JSON key file for the Service Account Terraform will use to authenticate"
  type        = string
  default     = "credentials.json"
}

variable "environment" {
  description = "The deployment environment (staging, production, etc.)"
  type        = string
}

variable "database_url" {
  description = "The database URL connection string"
  type        = string
  sensitive   = true
}

variable "direct_url" {
  description = "The direct URL string"
  type        = string
  sensitive   = true
}
