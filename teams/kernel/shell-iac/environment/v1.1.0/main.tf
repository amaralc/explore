locals {
  is_local = var.environment_type == "local"
}

# =============================================================================
# Cloud Path: moved to modules/cloud-resources/ — called directly by cloud
# root modules to avoid pulling cloud providers into local environments.
# Terraform merges required_providers from count=0 child modules, which
# forces the root to configure providers it doesn't need.
# =============================================================================

# =============================================================================
# Local Path: minikube + Crossplane + PostgreSQL + TLS + Logto
# =============================================================================

module "local_iam" {
  source = "./modules/local-iam"
  count  = local.is_local ? 1 : 0

  minikube_profile   = var.minikube_profile
  minikube_memory    = var.minikube_memory
  minikube_cpus      = var.minikube_cpus
  domain_name        = var.domain_name
  crossplane_version = var.crossplane_version
}
