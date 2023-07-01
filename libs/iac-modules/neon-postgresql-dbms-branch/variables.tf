variable "neon_project_id" {
  description = "The Neon Project ID"
  type        = string
  sensitive   = true
}

variable "environment_name" {
  description = "The name of the environment"
  type        = string
}

variable "neon_api_key" {
  description = "Neon API key"
  type        = string
  sensitive   = true
}
