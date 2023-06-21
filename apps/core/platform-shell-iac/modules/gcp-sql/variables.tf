variable "environment_name" {
  description = "The deployment environment (branch-name, commit-hash, etc.)"
  type        = string
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_location" {
  description = "The GCP location"
  type        = string
}

variable "gcp_network_id" {
  description = "The GCP network ID"
  type        = string
}

variable "gcp_service_networking_connection_id" {
  description = "The GCP service networking connection ID"
  type        = string
}

