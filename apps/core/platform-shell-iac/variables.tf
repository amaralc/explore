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
}

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
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
