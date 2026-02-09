variable "domain_name" {
  description = "The domain name for Logto endpoints (e.g. example.com or localhost)"
  type        = string
}

variable "db_secret_name" {
  description = "The name of the Kubernetes secret containing the DB_URL for Logto"
  type        = string
  default     = "logto-db-credentials"
}

variable "namespace" {
  description = "The Kubernetes namespace to deploy Logto into"
  type        = string
  default     = "logto"
}

variable "logto_image" {
  description = "The Logto container image (pin to a semver tag, e.g. svhd/logto:1.28.0)"
  type        = string
}

variable "enable_ingress" {
  description = "Whether to create an Ingress resource (disable for local/minikube)"
  type        = bool
  default     = true
}

variable "ingress_annotations" {
  description = "Annotations to apply to the Logto ingress resource"
  type        = map(string)
  default = {
    "kubernetes.io/ingress.global-static-ip-name" = "logto-ip"
    "networking.gke.io/managed-certificates"       = "logto-cert"
  }
}

variable "ingress_class_name" {
  description = "The ingress class name (e.g. 'nginx' for minikube, null for GKE default)"
  type        = string
  default     = null
}

variable "tls_secret_name" {
  description = "The name of the Kubernetes TLS secret for ingress (null to skip TLS block)"
  type        = string
  default     = null
}

variable "host_aliases" {
  description = "Additional /etc/hosts entries for the Logto pod (e.g. for local ingress resolution)"
  type = list(object({
    ip        = string
    hostnames = list(string)
  }))
  default = []
}

variable "endpoint_scheme" {
  description = "URL scheme for Logto endpoints (http or https)"
  type        = string
  default     = "https"

  validation {
    condition     = contains(["http", "https"], var.endpoint_scheme)
    error_message = "endpoint_scheme must be either 'http' or 'https'."
  }
}

variable "extra_env" {
  description = "Additional environment variables for the Logto container"
  type        = map(string)
  default     = {}
}
