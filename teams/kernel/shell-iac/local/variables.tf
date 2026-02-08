variable "minikube_profile" {
  description = "The minikube profile name for the local cluster"
  type        = string
  default     = "peerlab-iam"

  validation {
    condition     = can(regex("^[a-zA-Z0-9_-]+$", var.minikube_profile))
    error_message = "minikube_profile must contain only alphanumeric characters, hyphens, and underscores."
  }
}

variable "minikube_memory" {
  description = "Memory allocation for minikube in MB"
  type        = number
  default     = 4096

  validation {
    condition     = var.minikube_memory >= 2048 && var.minikube_memory <= 65536
    error_message = "minikube_memory must be between 2048 and 65536 MB."
  }
}

variable "minikube_cpus" {
  description = "CPU allocation for minikube"
  type        = number
  default     = 2

  validation {
    condition     = var.minikube_cpus >= 1 && var.minikube_cpus <= 16
    error_message = "minikube_cpus must be between 1 and 16."
  }
}

variable "domain_name" {
  description = "The domain name for local Logto endpoints"
  type        = string
  default     = "localhost"
}
