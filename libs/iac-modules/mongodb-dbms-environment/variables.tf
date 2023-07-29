variable "mongodb_atlas_org_id" {
  description = "The ID of the MongoDB Atlas organization"
  type        = string
  sensitive   = true
}

variable "environment_name" {
  description = "The name of the environment"
  type        = string
  sensitive   = false
}
