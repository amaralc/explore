variable "environment_name_prefix" {
  description = "The prefix of the environment name"
  type        = string

  validation {
    condition     = length(var.environment_name_prefix) <= 10
    error_message = "The environment name prefix must be 10 characters or less."
  }
}
