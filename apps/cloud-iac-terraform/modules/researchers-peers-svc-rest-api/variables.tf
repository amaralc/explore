variable "environment" {
  description = "Environment name (staging | production)"
  type        = string
}

variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "The region where resources will be created"
  type        = string

}
variable "credentials_path" {
  description = "The path to the JSON key file for the Service Account Terraform will use to authenticate"
  type        = string
  default     = "credentials.json"
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

variable "commit_hash" {
  description = "The commit hash of the source code to deploy"
  type        = string
}
