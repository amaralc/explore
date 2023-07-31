variable "unleash_api_url" {
  description = "The URL of the Unleash API"
  type        = string
}

variable "unleash_auth_token" {
  description = "The auth token of the Unleash API"
  type        = string
  sensitive   = true
}

variable "environment_name" {
  description = "The name of the environment"
  type        = string
}

