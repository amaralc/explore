variable "gcp_project_id" {
  description = "The ID of the GCP project where resources will be deployed"
  type        = string
}

variable "gcp_location" {
  description = "The location of the GCP project where resources will be deployed"
  type        = string
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the GCP Docker artifact repository"
  type        = string
}

variable "short_commit_sha" {
  description = "The short commit SHA"
  type        = string
}

variable "docker_file_path" {
  description = "The path to the Dockerfile"
  type        = string
}
