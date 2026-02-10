locals {
  is_local = var.environment_type == "local"
}

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

# =============================================================================
# Cloud Path: GCP + Neon + MongoDB Atlas + Logto on GKE
# =============================================================================

module "cloud_resources" {
  source = "./modules/cloud-resources"
  count  = local.is_local ? 0 : 1

  # Identity
  support_account_email     = var.support_account_email
  owner_account_email       = var.owner_account_email
  creator_service_account_email = var.creator_service_account_email

  # Environment
  branch_name                    = var.branch_name
  environment_name               = var.environment_name
  source_environment_branch_name = var.source_environment_branch_name
  environment_path               = var.environment_path
  domain_name                    = var.domain_name

  # GCP
  gcp_billing_account_id              = var.gcp_billing_account_id
  gcp_organization_id                 = var.gcp_organization_id
  gcp_shell_project_id                = var.gcp_shell_project_id
  gcp_location                        = var.gcp_location
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  gcp_dns_managed_zone_name           = var.gcp_dns_managed_zone_name
  short_commit_sha                    = var.short_commit_sha

  # Database
  source_environment_dbms_instance_id = var.source_environment_dbms_instance_id
  neon_project_location               = var.neon_project_location
  mongodb_atlas_org_id                = var.mongodb_atlas_org_id

  # Services
  nx_cloud_access_token = var.nx_cloud_access_token

  # Vercel
  production_environment_core_root_shell_graph_vercel_project_id          = var.production_environment_core_root_shell_graph_vercel_project_id
  production_environment_dx_dev_docs_browser_vercel_project_id            = var.production_environment_dx_dev_docs_browser_vercel_project_id
  production_environment_core_platform_shell_browser_vite_vercel_project_id = var.production_environment_core_platform_shell_browser_vite_vercel_project_id
  production_environment_core_platform_shell_browser_vercel_project_id    = var.production_environment_core_platform_shell_browser_vercel_project_id
}
