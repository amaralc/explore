variable "environment_name" {
  description = "The Neon Environment Name"
  type        = string
  default     = null
}

variable "neon_project_location" {
  description = "The Neon Project Location"
  type        = string
  sensitive   = true
}

variable "neon_project_id" {
  description = "The Neon Project ID. If you are creating a new project, leave this variable empty."
  type        = string
  sensitive   = true
  default     = null
}
