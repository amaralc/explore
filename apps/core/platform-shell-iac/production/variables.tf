variable "gcp_billing_account_id" {
  description = "The ID of the GCP billing account to associate this project with"
  type        = string
  sensitive   = true
  default     = null
}

variable "gcp_organization_id" {
  description = "The ID of the GCP organization where resources will be deployed"
  type        = string
  sensitive   = true
  default     = null
}

variable "gcp_project_id" {
  description = "The ID of the GCP project where resources will be deployed"
  type        = string
  sensitive   = true
}

variable "gcp_location" {
  description = "A valid GCP location where resources will be deployed"
  type        = string
  sensitive   = true
}
variable "gcp_credentials_file_path" {
  description = "The path to the JSON key file for the Service Account Terraform will use to authenticate"
  type        = string
  sensitive   = true
  default     = "credentials.json"
}

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
  type        = string
}

variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the Docker repository"
  type        = string
  default     = "docker-repository"
}

variable "mongodb_atlas_public_key" {
  description = "MongoDB Atlas public key"
  type        = string
  sensitive   = true
}

variable "mongodb_atlas_private_key" {
  description = "MongoDB Atlas private key"
  type        = string
  sensitive   = true
}

variable "mongodb_atlas_org_id" {
  description = "MongoDB Atlas organization ID"
  type        = string
  sensitive   = true
}

variable "support_account_email" {
  description = "The support email for the IAP brand"
  type        = string
  sensitive   = true
}

