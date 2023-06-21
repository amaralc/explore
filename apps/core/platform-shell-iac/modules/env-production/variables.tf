variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_location" {
  description = "The GCP location"
  type        = string
}

variable "gcp_credentials_path" {
  description = "The path to the GCP credentials file"
  type        = string
}

variable "commit_hash" {
  description = "The commit hash of the source code to deploy"
  type        = string
}
