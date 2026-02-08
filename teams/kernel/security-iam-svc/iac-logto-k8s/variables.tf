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
  description = "The Logto container image"
  type        = string
  default     = "svhd/logto:latest"
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
