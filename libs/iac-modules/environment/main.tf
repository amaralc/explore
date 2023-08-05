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
  count                         = 0 # local.is_production_environment ? 0 : 1 # For now, we wont use child projects in order to avoid billing account issues
  is_production_environment     = local.is_production_environment
  gcp_billing_account_id        = var.gcp_billing_account_id
  gcp_organization_id           = var.gcp_organization_id
  gcp_project_id                = var.gcp_project_id
  environment_name              = local.short_environment_name
  creator_service_account_email = var.creator_service_account_email
  owner_account_email           = var.owner_account_email
}


# Define which project ID to use
locals {
  project_id = var.gcp_project_id # local.is_production_environment ? var.gcp_project_id : module.gcp_project[0].project_id # For now, we wont use child projects in order to avoid billing account issues
}

# Enable APIs
module "gcp_apis" {
  count          = local.is_production_environment ? 1 : 0 # Since we are not using child projects, we need to enable APIs only in the production environment
  source         = "../gcp-apis"                           # path to the module
  gcp_project_id = local.project_id
  apis = [
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

# Create the main Virtual Private Cloud (VPC)
module "vpc" {
  source           = "../gcp-vpc"
  environment_name = local.short_environment_name # Limit the name to 24 characters
  gcp_project_id   = local.project_id
  gcp_location     = var.gcp_location
  depends_on       = [module.gcp_project, module.gcp_apis]
}

output "vpc" {
  value = module.vpc
}

# Create a PostgreSQL database management system (DBMS) instance clone for the preview environment
module "postgresql_dbms" {
  source                          = "../gcp-postgresql-dbms-environment"
  environment_name                = local.short_environment_name
  gcp_project_id                  = local.project_id
  gcp_location                    = var.gcp_location
  gcp_network_id                  = module.vpc.private_network.id
  gcp_private_vpc_connection_id   = module.vpc.private_vpc_connection.id
  gcp_sql_dbms_source_instance_id = var.source_environment_dbms_instance_id
  source_environment_branch_name  = var.source_environment_branch_name
  depends_on                      = [module.gcp_project, module.vpc, module.gcp_apis]
}

output "postgresql_dbms_instance_id" {
  value = module.postgresql_dbms.gcp_sql_dbms_instance_id
}

module "mongodb_dbms" {
  count                = local.is_production_environment ? 0 : 0 # Disabled module
  source               = "../mongodb-dbms-environment"
  environment_name     = local.short_environment_name
  mongodb_atlas_org_id = var.mongodb_atlas_org_id
  depends_on           = [module.gcp_project, module.vpc, module.gcp_apis]
}

# Identity and Access Management (IAM) Service
module "security-iam-svc" {
  count                 = local.is_production_environment ? 1 : 0 # Disabled module
  source                = "../../../apps/security/iam-svc/iac"
  gcp_project_id        = local.project_id
  support_account_email = var.support_account_email
  application_title     = local.is_production_environment ? "PeerLab" : "PeerLab Preview ${local.short_environment_name}"
  depends_on            = [module.gcp_apis, module.gcp_project]
  # source_environment_branch_name        = var.source_environment_branch_name # Informs the type of environment in order to decide how to treat database and users
  # environment_name                      = local.short_environment_name
  # gcp_location                          = var.gcp_location
  # short_commit_sha                      = var.short_commit_sha
  # gcp_docker_artifact_repository_name   = var.gcp_docker_artifact_repository_name
  # gcp_sql_dbms_instance_host            = module.postgresql_dbms.gcp_sql_dbms_instance_host
  # gcp_sql_dbms_instance_name            = module.postgresql_dbms.gcp_sql_dbms_instance_name
  # gcp_vpc_access_connector_name         = module.vpc.gcp_vpc_access_connector_name # Necessary to stablish connection with database
  # gcp_sql_dbms_instance_connection_name = module.postgresql_dbms.gcp_sql_dbms_instance_connection_name
}

module "core-platform-experiments" {
  count                                 = local.is_production_environment ? 1 : 0 # Enable module only in preview environments
  source                                = "../../../apps/core/platform-experiments/iac"
  source_environment_branch_name        = var.source_environment_branch_name # Informs the type of environment in order to decide how to treat database and users
  environment_name                      = local.short_environment_name
  gcp_project_id                        = local.project_id
  gcp_location                          = var.gcp_location
  short_commit_sha                      = var.short_commit_sha
  gcp_docker_artifact_repository_name   = var.gcp_docker_artifact_repository_name
  gcp_sql_dbms_instance_host            = module.postgresql_dbms.gcp_sql_dbms_instance_host
  gcp_sql_dbms_instance_name            = module.postgresql_dbms.gcp_sql_dbms_instance_name
  gcp_vpc_access_connector_name         = module.vpc.gcp_vpc_access_connector_name # Necessary to stablish connection with database
  gcp_sql_dbms_instance_connection_name = module.postgresql_dbms.gcp_sql_dbms_instance_connection_name
  depends_on                            = [module.postgresql_dbms, module.gcp_apis, module.gcp_project]
}

# Researchers Peers Microservice
module "researchers-peers" {
  source                              = "../../../apps/researchers/peers/svc-iac"
  count                               = local.is_production_environment ? 1 : 0 # Disable module in preview environments
  source_environment_branch_name      = var.source_environment_branch_name      # Informs the type of environment in order to decide how to treat database and users
  environment_name                    = local.short_environment_name
  gcp_project_id                      = local.project_id
  gcp_location                        = var.gcp_location
  short_commit_sha                    = var.short_commit_sha
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  gcp_sql_dbms_instance_host          = module.postgresql_dbms.gcp_sql_dbms_instance_host
  gcp_sql_dbms_instance_name          = module.postgresql_dbms.gcp_sql_dbms_instance_name
  gcp_vpc_access_connector_name       = module.vpc.gcp_vpc_access_connector_name # Necessary to stablish connection with database
  depends_on                          = [module.postgresql_dbms, module.gcp_apis, module.gcp_project]
}

# Nx Graph
module "core-platform-shell-browser-vite" {
  source                           = "../environment-vercel"
  count                            = local.is_production_environment ? 1 : 0 # Disable module in preview environments
  project_name                     = "core-platform-shell-browser-vite"
  framework                        = "vite"
  git_provider                     = "github"
  username_and_repository          = "amaralc/peerlab"
  branch_name                      = var.branch_name
  is_production_environment        = local.is_production_environment
  install_command                  = local.is_production_environment ? "pnpm install" : null
  build_command                    = local.is_production_environment ? "pnpm nx build core-platform-shell-browser-vite --prod" : null # Use build-graph command to prevent building dependencies used for graphing purposes only
  output_directory                 = local.is_production_environment ? "dist/apps/core/platform-shell-browser-vite" : null            # Attention to the output of non-nextjs projects
  ignore_command                   = local.is_production_environment ? null : null                                                    # "if [ $VERCEL_ENV == 'production' ]; then exit 1; else exit 0; fi" : null
  preview_environment_variables    = local.is_production_environment ? null : null                                                    # Map of string key and values
  production_environment_variables = local.is_production_environment ? null : null                                                    # Set of objects with key, value and target (production, preview, development)
  source_environment_project_id    = var.production_environment_core_platform_shell_browser_vite_vercel_project_id

  depends_on = [module.researchers-peers]
}

output "core_platform_shell_browser_vite_vercel_project_id" {
  value = local.is_production_environment ? module.core-platform-shell-browser-vite[0].vercel_project_id : null
}

# Documentation with Docusaurus
module "dx-dev-docs-browser" {
  source                           = "../environment-vercel"
  count                            = local.is_production_environment ? 1 : 0 # Disable module in preview environments
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
  value = local.is_production_environment ? module.dx-dev-docs-browser[0].vercel_project_id : null
}

# Nx Graph
module "core-root-shell-graph" {
  source                           = "../environment-vercel"
  count                            = local.is_production_environment ? 1 : 0 # Disable module in preview environments
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
  value = local.is_production_environment ? module.core-root-shell-graph[0].vercel_project_id : null
}
