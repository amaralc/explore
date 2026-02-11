variable "kubeconfig_context" {
  description = "The kubectl context for the local cluster (e.g. minikube profile name)"
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z0-9._@/-]+$", var.kubeconfig_context))
    error_message = "kubeconfig_context must contain only alphanumeric characters, dots, underscores, @, slashes, and hyphens."
  }
}

variable "domain_name" {
  description = "The domain name for local Logto endpoints"
  type        = string
  default     = "localhost"
}
