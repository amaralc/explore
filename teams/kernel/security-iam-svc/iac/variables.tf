variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_location" {
  description = "The Google Cloud project location (region)"
  type        = string
}

variable "environment_name" {
  description = "The deployment environment (branch-name, commit-hash, etc.)"
  type        = string
}

variable "domain_name" {
  description = "The domain name for IAM service endpoints"
  type        = string
}

variable "gcp_network_id" {
  description = "The VPC network ID (from the vpc module)"
  type        = string
}
