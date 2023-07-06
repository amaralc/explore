# TODO -> How to prevent one preview branch from applying changes that disrupt other preview environments?
# #       Option: create a new project for every preview branch?
# #       Actually the entire tfstate should be isolated for each preview branch

locals {
  source_environment_branch_name = "production"
}

data "google_sql_database_instance" "production" {
  name = substr("${var.gcp_project_id}-${local.source_environment_branch_name}", 0, 63)
}

data "local_file" "credentials" {
  filename = "${path.module}/credentials.json"
}

locals {
  credentials           = jsondecode(data.local_file.credentials.content)
  service_account_email = local.credentials.client_email
}


# Preview Environment
module "preview-environment-01" {
  count                                                                = 0 # Set 0 to disable this module and 1 to enable it
  source                                                               = "../../../../libs/iac-modules/environment"
  branch_name                                                          = "feature/PEER-549-api-gateway"
  owner_account_email                                                  = var.owner_account_email
  creator_service_account_email                                        = local.service_account_email
  source_environment_branch_name                                       = local.source_environment_branch_name
  source_environment_dbms_instance_id                                  = data.google_sql_database_instance.production.id
  short_commit_sha                                                     = var.short_commit_sha
  gcp_project_id                                                       = var.gcp_project_id
  gcp_billing_account_id                                               = var.gcp_billing_account_id
  gcp_organization_id                                                  = var.gcp_organization_id
  gcp_location                                                         = var.gcp_location
  gcp_docker_artifact_repository_name                                  = var.gcp_docker_artifact_repository_name
  production_environment_core_platform_shell_browser_vercel_project_id = var.core_platform_shell_browser_vercel_project_id
  production_environment_core_root_shell_graph_vercel_project_id       = var.core_root_shell_graph_vercel_project_id
  production_environment_dx_dev_docs_browser_vercel_project_id         = var.dx_dev_docs_browser_vercel_project_id
  depends_on                                                           = [data.google_sql_database_instance.production]
}
