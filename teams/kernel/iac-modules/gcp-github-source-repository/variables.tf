variable "shell_gcp_project_id" {
  type        = string
  description = "ID of the shell iac project"
  sensitive   = true
}

variable "github_personal_access_token" {
  type        = string
  description = "Personal access token for GitHub"
  sensitive   = true
}

variable "gcp_location" {
  type        = string
  description = "Location of the GCP resources"
  sensitive   = true
}

variable "gcp_github_installation_id" {
  type        = number
  description = "GitHub installation ID"
  sensitive   = true
}

variable "service_account_email" {
  type        = string
  description = "Email of the service account"
  sensitive   = true
}
