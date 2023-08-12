locals {
  is_production_environment = var.source_environment_branch_name == null ? true : false # Set feature flag to control the type of environment
}

# Output the branch name for other modules to use as source
output "branch_name" {
  value = var.branch_name
}

locals {
  short_environment_name = local.is_production_environment ? "production" : "${var.environment_name}" # Limit the name to 24 characters
}

# Create child projects for each environment (downsides: more projects to manage, more billing accounts to manage)
module "gcp_project" {
  source                        = "../gcp-project"
  count                         = local.is_production_environment ? 1 : 0 # Enable project creation for production environments only
  is_production_environment     = local.is_production_environment
  gcp_billing_account_id        = var.gcp_billing_account_id
  gcp_organization_id           = var.gcp_organization_id
  gcp_project_id                = var.gcp_project_id
  environment_name              = local.short_environment_name
  creator_service_account_email = var.creator_service_account_email
  owner_account_email           = var.owner_account_email
  apis = [
    "cloudresourcemanager.googleapis.com",
    "serviceusage.googleapis.com",
    "artifactregistry.googleapis.com",
    "compute.googleapis.com",
    "servicenetworking.googleapis.com",
    "sqladmin.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com",
    "vpcaccess.googleapis.com",
    "run.googleapis.com",
    "cloudbilling.googleapis.com",
    "firebase.googleapis.com",
    "serviceusage.googleapis.com",    # https://firebase.google.com/docs/projects/terraform/get-started
    "identitytoolkit.googleapis.com", # Enable Firebase Identity Toolkit (https://firebase.google.com/docs/projects/terraform/get-started#tf-sample-auth)
    "cloudidentity.googleapis.com",   # Enable Google Identity Platform (https://stackoverflow.com/questions/70317379/how-to-configure-google-identity-platform-with-cli-sdk)
    "iap.googleapis.com",             # Enable Google Identity Aware Proxy (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/identity_platform_oauth_idp_config)
    # "apigee.googleapis.com" # TODO: Enable this API only if we choose to use Apigee. See https://peerlab.atlassian.net/browse/PEER-549
  ]
}

# Define which project ID to use
locals {
  project_id = module.gcp_project[0].project_id # local.is_production_environment ? var.gcp_project_id : module.gcp_project[0].project_id # For now, we wont use child projects in order to avoid billing account issues
}

locals {
  is_gcp_sql_instance_enabled = local.is_production_environment ? 0 : 0 # Weather to enable a SQL instance or not
}

# Create the main Virtual Private Cloud (VPC)
module "vpc" {
  source           = "../gcp-vpc"
  count            = local.is_production_environment ? 0 : 0 # Enabled in production and preview environments
  environment_name = local.short_environment_name            # Limit the name to 24 characters
  gcp_project_id   = local.project_id
  gcp_location     = var.gcp_location
  depends_on       = [module.gcp_project]
}

output "vpc" {
  value = module.vpc
}

# Create a PostgreSQL database management system (DBMS) instance clone for the preview environment
module "postgresql_dbms" {
  source                          = "../gcp-postgresql-dbms-environment"
  count                           = local.is_production_environment ? 0 : 0
  environment_name                = local.short_environment_name
  gcp_project_id                  = local.project_id
  gcp_location                    = var.gcp_location
  gcp_network_id                  = module.vpc[0].private_network.id
  gcp_private_vpc_connection_id   = module.vpc[0].private_vpc_connection.id
  gcp_sql_dbms_source_instance_id = var.source_environment_dbms_instance_id
  source_environment_branch_name  = var.source_environment_branch_name
  depends_on                      = [module.gcp_project, module.vpc]
}

output "postgresql_dbms_instance_id" {
  value = length(module.postgresql_dbms) > 0 ? module.postgresql_dbms[0].gcp_sql_dbms_instance_id : null
}

module "mongodb_dbms" {
  source               = "../mongodb-dbms-environment"
  count                = local.is_production_environment ? 0 : 0 # Disabled module
  environment_name     = local.short_environment_name
  mongodb_atlas_org_id = var.mongodb_atlas_org_id
  depends_on           = [module.gcp_project, module.vpc]
}

# Identity and Access Management (IAM) Service
module "security-iam-svc" {
  source            = "../../../apps/security/iam-svc/iac"
  count             = local.is_production_environment ? 1 : 0 # Enabled in production environments only
  gcp_project_id    = local.project_id
  application_title = local.is_production_environment ? "Peerlab AC" : "Peerlab AC Preview ${local.short_environment_name}"
  depends_on        = [module.gcp_project]
}

module "core-platform-experiments" {
  source                                = "../../../apps/core/platform-experiments/iac"
  count                                 = local.is_production_environment ? 0 : 0 # Enabled in production
  source_environment_branch_name        = var.source_environment_branch_name      # Informs the type of environment in order to decide how to treat database and users
  environment_name                      = local.short_environment_name
  gcp_project_id                        = local.project_id
  gcp_location                          = var.gcp_location
  short_commit_sha                      = var.short_commit_sha
  gcp_docker_artifact_repository_name   = var.gcp_docker_artifact_repository_name
  gcp_sql_dbms_instance_host            = module.postgresql_dbms[0].gcp_sql_dbms_instance_host
  gcp_sql_dbms_instance_name            = module.postgresql_dbms[0].gcp_sql_dbms_instance_name
  gcp_vpc_access_connector_name         = module.vpc[0].gcp_vpc_access_connector_name # Necessary to stablish connection with database
  gcp_sql_dbms_instance_connection_name = module.postgresql_dbms[0].gcp_sql_dbms_instance_connection_name
  depends_on                            = [module.postgresql_dbms, module.gcp_project]
}

# Researchers Peers Microservice
module "researchers-peers" {
  source                              = "../../../apps/researchers/peers/svc-iac"
  count                               = local.is_production_environment ? 0 : 0 # Disable module in preview environments
  source_environment_branch_name      = var.source_environment_branch_name      # Informs the type of environment in order to decide how to treat database and users
  environment_name                    = local.short_environment_name
  gcp_project_id                      = local.project_id
  gcp_location                        = var.gcp_location
  short_commit_sha                    = var.short_commit_sha
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  gcp_sql_dbms_instance_host          = module.postgresql_dbms[0].gcp_sql_dbms_instance_host
  gcp_sql_dbms_instance_name          = module.postgresql_dbms[0].gcp_sql_dbms_instance_name
  gcp_vpc_access_connector_name       = module.vpc[0].gcp_vpc_access_connector_name # Necessary to stablish connection with database
  depends_on                          = [module.postgresql_dbms, module.gcp_project]
}

# NextJS
module "core-platform-shell-browser-nextjs" {
  source                        = "../../../apps/core/platform-shell-browser/iac"
  is_service_enabled            = false
  is_production_environment     = local.is_production_environment
  branch_name                   = var.branch_name
  source_environment_project_id = var.production_environment_core_platform_shell_browser_vercel_project_id
  depends_on                    = [module.researchers-peers]
}

# Vite
module "core-platform-shell-browser-vite" {
  source                        = "../../../apps/core/platform-shell-browser-vite/iac"
  is_service_enabled            = false
  is_production_environment     = local.is_production_environment
  branch_name                   = var.branch_name
  source_environment_project_id = var.production_environment_core_platform_shell_browser_vite_vercel_project_id
  depends_on                    = [module.researchers-peers]
}

# Documentation with Docusaurus
module "dx-dev-docs-browser" {
  source                           = "../environment-vercel"
  count                            = local.is_production_environment ? 1 : 0 # Disable module
  project_name                     = "dx-dev-docs-browser"
  framework                        = null # https://vercel.com/docs/rest-api/endpoints#create-a-new-project
  git_provider                     = "github"
  username_and_repository          = "amaralc/peerlab"
  branch_name                      = var.branch_name
  is_production_environment        = local.is_production_environment
  install_command                  = local.is_production_environment ? "pnpm install" : null
  dev_command                      = local.is_production_environment ? "pnpm nx serve dx-dev-docs-browser" : null             # Vercel dev command
  build_command                    = local.is_production_environment ? "pnpm nx build-docs dx-dev-docs-browser --prod" : null # Use build-docs command to prevent building dependencies used for graphing purposes only
  output_directory                 = local.is_production_environment ? "dist/apps/dx/dev-docs-browser" : null                 # Attention to the output of non-nextjs projects
  ignore_command                   = local.is_production_environment ? null : null                                            # "if [ $VERCEL_ENV == 'production' ]; then exit 1; else exit 0; fi" : null
  preview_environment_variables    = local.is_production_environment ? null : null                                            # Map of string key and values
  production_environment_variables = local.is_production_environment ? null : null                                            # Set of objects with key, value and target (production, preview, development)
  source_environment_project_id    = var.production_environment_dx_dev_docs_browser_vercel_project_id

  depends_on = [module.researchers-peers]
}

output "dx_dev_docs_browser_vercel_project_id" {
  value = local.is_production_environment && length(module.dx-dev-docs-browser) > 0 ? module.dx-dev-docs-browser[0].vercel_project_id : null
}

# Nx Graph
module "core-root-shell-graph" {
  source                           = "../environment-vercel"
  count                            = local.is_production_environment ? 0 : 0 # Disable module
  project_name                     = "core-root-shell-graph"
  framework                        = null
  git_provider                     = "github"
  username_and_repository          = "amaralc/peerlab"
  branch_name                      = var.branch_name
  is_production_environment        = local.is_production_environment
  install_command                  = local.is_production_environment ? "pnpm install" : null
  build_command                    = local.is_production_environment ? "pnpm nx build-graph core-root-shell-graph --prod" : null # Use build-graph command to prevent building dependencies used for graphing purposes only
  output_directory                 = local.is_production_environment ? "dist/apps/core/root-shell-graph" : null                  # Attention to the output of non-nextjs projects
  ignore_command                   = local.is_production_environment ? null : null                                               # "if [ $VERCEL_ENV == 'production' ]; then exit 1; else exit 0; fi" : null
  preview_environment_variables    = local.is_production_environment ? null : null                                               # Map of string key and values
  production_environment_variables = local.is_production_environment ? null : null                                               # Set of objects with key, value and target (production, preview, development)
  source_environment_project_id    = var.production_environment_core_root_shell_graph_vercel_project_id
}

output "core_root_shell_graph_vercel_project_id" {
  value = local.is_production_environment && length(module.core-root-shell-graph) > 0 ? module.core-root-shell-graph[0].vercel_project_id : null
}
