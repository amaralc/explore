variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "apis" {
  description = "The list of APIs to enable"
  type        = list(string)
}
