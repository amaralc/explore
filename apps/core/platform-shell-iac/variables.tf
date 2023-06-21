variable "gcp_billing_account_id" {
  description = "The Google Cloud billing account ID"
  type        = string
  sensitive   = true
}

variable "gcp_management_shell_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_location" {
  description = "A valid GCP location where resources will be deployed"
  type        = string
}
variable "credentials_path" {
  description = "The path to the JSON key file for the Service Account Terraform will use to authenticate"
  type        = string
}

variable "commit_hash" {
  description = "The commit hash of the source code to deploy"
  type        = string
}

# variable "vercel_api_token" {
#   description = "Vercel API token"
#   type        = string
#   sensitive   = true
# }

# variable "gcp_docker_artifact_repository_name" {
#   description = "The name of the Docker repository"
#   type        = string
#   default     = "docker-repository"
# }
