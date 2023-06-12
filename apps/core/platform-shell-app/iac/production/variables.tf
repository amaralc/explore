variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "environment_name" {
  description = "Name of the environment"
  type        = string
}
