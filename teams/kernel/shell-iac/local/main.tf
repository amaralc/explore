# Local Environment - Thin wrapper around environment/v1.1.0
#
# Usage:
#   terraform init
#   terraform apply -auto-approve

module "environment" {
  source             = "../../iac-modules/environment/v1.1.0"
  environment_type   = "local"
  domain_name        = var.domain_name
  minikube_profile   = var.minikube_profile
  minikube_memory    = var.minikube_memory
  minikube_cpus      = var.minikube_cpus
  crossplane_version = var.crossplane_version
}