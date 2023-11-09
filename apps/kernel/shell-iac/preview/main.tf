# TODO -> How to prevent one preview branch from applying changes that disrupt other preview environments?
# #       Option: create a new project for every preview branch?
# #       Actually the entire tfstate should be isolated for each preview branch

locals {
  source_environment_branch_name = "production"
  preview_environments_enabled   = true # TODO -> Set as repository environment variable
}

data "google_sql_database_instance" "production" {
  count = local.preview_environments_enabled == true ? 1 : 0
  name  = substr("${var.gcp_project_id}-${local.source_environment_branch_name}", 0, 63)
}

data "local_file" "credentials" {
  filename = "${path.module}/credentials.json"
}

locals {
  credentials           = jsondecode(data.local_file.credentials.content)
  service_account_email = local.credentials.client_email
}

# Get project
data "google_project" "core_platform_shell_iac" {
  project_id = var.gcp_project_id
}


# Preview Environment
module "preview-environment" {
  count                                                                     = local.preview_environments_enabled == true ? 1 : 0
  source                                                                    = "../environment"
  branch_name                                                               = var.branch_name
  environment_name                                                          = var.environment_name
  owner_account_email                                                       = var.owner_account_email
  creator_service_account_email                                             = local.service_account_email
  source_environment_branch_name                                            = local.source_environment_branch_name
  source_environment_dbms_instance_id                                       = data.google_sql_database_instance.production[0].id
  short_commit_sha                                                          = var.short_commit_sha
  gcp_project_id                                                            = var.gcp_project_id
  gcp_billing_account_id                                                    = var.gcp_billing_account_id
  gcp_organization_id                                                       = var.gcp_organization_id
  gcp_location                                                              = var.gcp_location
  gcp_docker_artifact_repository_name                                       = var.gcp_docker_artifact_repository_name
  neon_project_location                                                     = var.neon_project_location
  production_environment_core_platform_shell_browser_vite_vercel_project_id = var.core_platform_shell_browser_vite_vercel_project_id
  production_environment_core_root_shell_graph_vercel_project_id            = var.core_root_shell_graph_vercel_project_id
  production_environment_dx_dev_docs_browser_vercel_project_id              = var.dx_dev_docs_browser_vercel_project_id
  support_account_email                                                     = var.support_account_email
  gcp_shell_project_id                                                      = var.gcp_project_id
  gcp_shell_project_number                                                  = data.google_project.core_platform_shell_iac.number
  nx_cloud_access_token                                                     = var.nx_cloud_access_token
  domain_name                                                               = var.domain_name
  depends_on                                                                = [data.google_sql_database_instance.production]
}
