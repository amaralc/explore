variable "account_email" {
  description = "The email of the account"
  type        = string
}

variable "account_member_type" {
  description = "The member type of the account. Must be one of user, serviceAccount or group"
  type        = string
  default     = "user"

  validation {
    condition     = contains(["user", "serviceAccount", "group"], var.account_member_type)
    error_message = "The account_member_type must be one of user, serviceAccount or group"
  }
}


variable "gcp_project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "gcp_roles" {
  description = "The list of roles to assign to the service account"
  type        = list(string)
}
