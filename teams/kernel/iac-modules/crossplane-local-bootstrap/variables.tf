variable "crossplane_version" {
  description = "The Crossplane Helm chart version"
  type        = string
  default     = "1.15.0"
}

variable "provider_kubernetes_version" {
  description = "The provider-kubernetes package version"
  type        = string
  default     = "v0.14.1"
}

variable "kubeconfig_context" {
  description = "The kubectl context for local-exec commands (must match the target cluster)"
  type        = string
  default     = ""
}
