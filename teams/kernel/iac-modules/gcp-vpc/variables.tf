variable "environment_name" {
  description = "The deployment environment (branch-name, commit-hash, etc.)"
  type        = string
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_location" {
  description = "The Google Cloud project location"
  type        = string
}
