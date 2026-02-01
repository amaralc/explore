variable "environment_name" {
  description = "The deployment environment (branch-name, commit-hash, etc.)"
  type        = string
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_location" {
  description = "The Google Cloud project location (region)"
  type        = string
}

variable "gcp_network_id" {
  description = "The VPC network ID for the GKE cluster"
  type        = string
}

variable "enable_deletion_protection" {
  description = "Whether to enable deletion protection on the cluster"
  type        = bool
  default     = true
}

variable "master_authorized_cidr_blocks" {
  description = "CIDR blocks authorized to access the Kubernetes master endpoint"
  type = list(object({
    cidr_block   = string
    display_name = string
  }))
  default = []
}
