variable "crossplane_version" {
  description = "The Crossplane Helm chart version"
  type        = string
  default     = "2.1.4"
}

variable "provider_kubernetes_version" {
  description = "The provider-kubernetes package version"
  type        = string
  default     = "v1.2.0"
}

variable "kubeconfig_context" {
  description = "The kubectl context for local-exec commands (must match the target cluster)"
  type        = string
  default     = ""

  validation {
    condition     = can(regex("^[a-zA-Z0-9._@/-]*$", var.kubeconfig_context))
    error_message = "kubeconfig_context must contain only alphanumeric characters, dots, underscores, @, slashes, and hyphens."
  }
}
