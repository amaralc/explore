# Security IAM Service - Orchestrator
# Deploys GKE cluster, Crossplane, and Logto IAM service

# =============================================================================
# Layer 1: GKE Autopilot Cluster
# =============================================================================

module "gke_cluster" {
  source                     = "../../iac-modules/gcp-gke-cluster"
  environment_name           = var.environment_name
  gcp_project_id             = var.gcp_project_id
  gcp_location               = var.gcp_location
  gcp_network_id             = var.gcp_network_id
  enable_deletion_protection = false
}

# =============================================================================
# Layer 2: Crossplane Bootstrap
# =============================================================================

module "crossplane" {
  source                 = "../../iac-modules/gcp-gke-crossplane"
  gcp_project_id         = var.gcp_project_id
  gcp_location           = var.gcp_location
  environment_name       = var.environment_name
  cluster_endpoint       = module.gke_cluster.cluster_endpoint
  cluster_ca_certificate = module.gke_cluster.cluster_ca_certificate

  depends_on = [module.gke_cluster]
}

# =============================================================================
# Layer 3: Crossplane-managed PostgreSQL database
# =============================================================================

# PostgreSQL 17 for Logto
module "logto_database" {
  source               = "../../iac-modules/crossplane-postgresql"
  gcp_project_id       = var.gcp_project_id
  gcp_location         = var.gcp_location
  environment_name     = var.environment_name
  provider_config_name = module.crossplane.provider_config_name
  database_name        = "logto"
  namespace            = "logto"
  postgresql_version   = "POSTGRES_17"

  depends_on = [module.crossplane]
}

# =============================================================================
# Layer 4: Logto Kubernetes resources
# =============================================================================

# Namespace is created here (not in the submodule) so it can be shared
# with other resources like the Crossplane-managed database claim.
resource "kubernetes_namespace_v1" "logto" {
  metadata {
    name = "logto"
    labels = {
      "app.kubernetes.io/part-of"   = "security-iam-svc"
      "app.kubernetes.io/component" = "logto"
      "team"                        = "kernel"
    }
  }
}

module "logto_k8s" {
  source         = "../iac-logto-k8s"
  domain_name    = var.domain_name
  logto_image    = "svhd/logto:1.36.0"
  namespace      = kubernetes_namespace_v1.logto.metadata[0].name
  db_secret_name = module.logto_database.db_credentials_secret_name
  enable_ingress = true

  depends_on = [module.logto_database]
}

# State migration: moved blocks for zero-downtime refactoring.
# These map old inline resource addresses to the new submodule paths.
# The namespace stays at the root level, so no moved block is needed for it.
moved {
  from = kubernetes_config_map_v1.logto
  to   = module.logto_k8s.kubernetes_config_map_v1.logto
}

moved {
  from = kubernetes_deployment_v1.logto
  to   = module.logto_k8s.kubernetes_deployment_v1.logto
}

moved {
  from = kubernetes_service_v1.logto
  to   = module.logto_k8s.kubernetes_service_v1.logto
}

moved {
  from = kubernetes_ingress_v1.logto
  to   = module.logto_k8s.kubernetes_ingress_v1.logto[0]
}
