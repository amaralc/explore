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

variable "image_name" {
  description = "The name of the Docker image"
  type        = string
}

variable "environment_name" {
  description = "The name of the environment"
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

variable "trigger_name" {
  description = "The name of the trigger"
  type        = string
}

variable "branch_name" {
  description = "The name of the branch"
  type        = string
}

# variable "gcp_cloudbuildv2_repository_id" {
#   description = "The ID of the Cloud Build V2 repository"
#   type        = string
# }

variable "nx_affected_script" {
  description = "The script to be executed"
  type        = string
}
