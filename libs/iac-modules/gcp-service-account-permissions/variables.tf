variable "service_account_email" {
  description = "The email of the service account"
  type        = string
}

variable "gcp_project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "gcp_roles" {
  description = "The list of roles to assign to the service account"
  type        = list(string)
}
