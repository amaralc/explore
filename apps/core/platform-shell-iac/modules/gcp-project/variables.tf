variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_project_name" {
  description = "The Google Cloud project name"
  type        = string
}

variable "gcp_billing_account_id" {
  description = "The Google Cloud billing account ID"
  type        = string
  sensitive   = true
}
