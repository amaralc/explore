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

variable "cluster_endpoint" {
  description = "The GKE cluster endpoint"
  type        = string
  sensitive   = true
}

variable "cluster_ca_certificate" {
  description = "The base64-encoded CA certificate of the GKE cluster"
  type        = string
  sensitive   = true
}

variable "crossplane_version" {
  description = "The Crossplane Helm chart version"
  type        = string
  default     = "1.15.0"
}
