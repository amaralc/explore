variable "service_account_name" {
  description = "The name of the service account. The account id that is used to generate the service account email address and a stable unique id. It is unique within a project, must be 6-30 characters long, and match the regular expression a-z to comply with RFC1035. Changing this forces a new service account to be created."
  type        = string
}

variable "gcp_project_id" {
  description = "The ID of the GCP project"
  type        = string
}
