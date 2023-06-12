variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Name of the environment (e.g. branch-name, commit-hash, etc.)"
  type        = string
}
