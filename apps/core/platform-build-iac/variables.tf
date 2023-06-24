variable "gcp_project_id" {
  description = "The ID of the GCP project where resources will be deployed"
  type        = string
}

variable "gcp_location" {
  description = "A valid GCP location where resources will be deployed"
  type        = string
}
variable "gcp_credentials_file_path" {
  description = "The path to the JSON key file for the Service Account Terraform will use to authenticate"
  type        = string
  default     = "credentials.json"
}

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
  type        = string
}
