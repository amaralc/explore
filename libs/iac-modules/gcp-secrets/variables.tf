variable "secrets" {
  description = "Array of secrets to be created"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}
