variable "branch_name" {
  description = "The name of the branch"
  type        = string
}

variable "environment_name" {
  description = "The name of the environment, calculated based on the branch name as -> environment_name=$(echo \"$branch_name\" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g'). In other words, it replaces all uppercase letters with lowercase letters, and replaces all non-alphanumeric characters with dashes."
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

variable "short_commit_sha" {
  description = "The commit short SHA of the source code to deploy"
  type        = string
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the Docker repository"
  type        = string
}

variable "source_environment_dbms_instance_id" {
  description = "The ID of the source DBMS, from which this DBMS will be copied"
  type        = string
  default     = null
}


variable "source_environment_branch_name" {
  description = "The name of the source environment branch" # Used by Vercel provider
  type        = string
  default     = null
}

