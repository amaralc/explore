variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_location" {
  description = "The GCP location"
  type        = string
}

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
  type        = string
}

variable "vercel_api_token" {
  description = "The Vercel API token"
  type        = string
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the Docker repository"
  type        = string
}
