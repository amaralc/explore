variable "database_url" {
  description = "The database URL connection string"
  type        = string
  sensitive   = true
}

variable "direct_url" {
  description = "The direct URL string"
  type        = string
  sensitive   = true
}

variable "fly_api_token" {
  description = "FLY API token"
  type        = string
  sensitive   = true
}

