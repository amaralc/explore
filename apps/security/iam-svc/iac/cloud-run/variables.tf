variable "docker_image_name" {
  description = "The name of the Docker image"
  type        = string
}

variable "short_commit_sha" {
  description = "The commit hash of the source code to deploy"
  type        = string
}

variable "environment_name" {
  description = "Environment name (staging | production)"
  type        = string
}

variable "gcp_location" {
  description = "The region where resources will be created"
  type        = string
}

variable "gcp_jdbc_database_connection_url_secret_id" {
  description = "The ID of the secret for the jdbc database connection url"
  type        = string
}

variable "gcp_jdbc_database_connection_url_secret_version" {
  description = "A version of the secret for the jdbc database connection url"
  type        = string
}

variable "gcp_dbms_username_secret_id" {
  description = "The username of the database user"
  type        = string
}

variable "gcp_dbms_username_secret_version" {
  description = "A version of the secret for the username of the database user"
  type        = string
}

variable "gcp_dbms_password_secret_id" {
  description = "The password of the database user"
  type        = string
}

variable "gcp_dbms_password_secret_version" {
  description = "A version of the secret for the password of the database user"
  type        = string
}

variable "gcp_service_account_email" {
  description = "The email of the GCP Service Account"
  type        = string
  sensitive   = true
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_docker_artifact_repository_name" {
  description = "The name of the Docker repository"
  type        = string
}

variable "gcp_vpc_access_connector_name" {
  description = "The name of the VPC access connector"
  type        = string
}

variable "gcp_sql_dbms_instance_connection_name" {
  description = "The connection name of the Cloud SQL DBMS instance"
  type        = string
}