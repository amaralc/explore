variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "application_title" {
  description = "The title of the application"
  type        = string
}

variable "owner_account_email" {
  description = "The email of the account that will own the resources"
  type        = string
  sensitive   = true
}

