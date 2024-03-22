locals {
  is_production_environment = var.source_environment_branch_name == null ? true : false # Set feature flag to control the type of environment
}

# Output the branch name for other modules to use as source
output "branch_name" {
  value = var.branch_name
}

# Create child projects for each environment (downsides: more projects to manage, more billing accounts to manage)
module "gcp_project" {
  source                        = "../../../../libs/iac-modules/gcp-project"
  count                         = local.is_production_environment ? 1 : 0 # Enable project creation for production environments only
  is_production_environment     = local.is_production_environment
  gcp_billing_account_id        = var.gcp_billing_account_id
  gcp_organization_id           = var.gcp_organization_id
  gcp_shell_project_id          = var.gcp_shell_project_id
  environment_name              = var.environment_name # Limit the name to 24 characters
  creator_service_account_email = var.creator_service_account_email
  owner_account_email           = var.owner_account_email
  apis = [
    "cloudresourcemanager.googleapis.com",
    "serviceusage.googleapis.com", # https://firebase.google.com/docs/projects/terraform/get-started
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
    "identitytoolkit.googleapis.com", # Enable Firebase Identity Toolkit (https://firebase.google.com/docs/projects/terraform/get-started#tf-sample-auth)
    "cloudidentity.googleapis.com",   # Enable Google Identity Platform (https://stackoverflow.com/questions/70317379/how-to-configure-google-identity-platform-with-cli-sdk)
    "iap.googleapis.com",             # Enable Google Identity Aware Proxy (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/identity_platform_oauth_idp_config)
    "apikeys.googleapis.com",         # Enable API Keys API (https://cloud.google.com/api-keys/docs/reference/rest)
    "dns.googleapis.com",
    "cloudfunctions.googleapis.com", # Enable Cloud Functions API (create functions that react to firebase user creations and other)
    "eventarc.googleapis.com",       # Enable Eventarc API (allow reactions to firebase user creations)
    "cloudbuild.googleapis.com"      # Enable Cloud Build API (necessary for building the function)
    # "apigee.googleapis.com" # TODO: Enable this API only if we choose to use Apigee. See https://peerlab.atlassian.net/browse/PEER-549
  ]
}

# # Fake API Gateway
# module "api-gateway" {
#   count                               = 0
#   source                              = "../../api-gateway-svc/iac"
#   service_name                        = "api-gateway-svc"
#   branch_name                         = "production"
#   domain_name                         = var.domain_name
#   environment_variables               = {}
#   gcp_project_id                      = module.gcp_project[0].project_id
#   gcp_shell_project_id                = var.gcp_shell_project_id
#   gcp_location                        = var.gcp_location
#   gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
#   gcp_dns_managed_zone_name           = var.gcp_dns_managed_zone_name
#   environment_name                    = var.environment_name
#   short_commit_sha                    = var.short_commit_sha
#   depends_on                          = [module.gcp_project]
# }

# Create the main Virtual Private Cloud (VPC)
module "vpc" {
  source           = "../../../../libs/iac-modules/gcp-vpc"
  count            = local.is_production_environment ? 1 : 0 # Enabled in production and preview environments
  environment_name = var.environment_name                    # Limit the name to 24 characters
  gcp_project_id   = module.gcp_project[0].project_id
  gcp_location     = var.gcp_location
  depends_on       = [module.gcp_project]
}

output "vpc" {
  value = module.vpc
}

module "postgresql_dbms" {
  source                         = "../../../../libs/iac-modules/postgresql-dbms-environment"
  count                          = local.is_production_environment ? 1 : 0
  environment_name               = var.environment_name
  source_environment_branch_name = var.source_environment_branch_name
  dbms_provider = {
    # Switch back to Neon after https://github.com/kislerdm/terraform-provider-neon/issues/51 is fixed
    neon = {
      project_id       = local.is_production_environment ? null : module.gcp_project[0].project_id # TODO: This should refer to the Neon project ID
      project_location = var.neon_project_location
    }

    # gcp = {
    #   location                  = var.gcp_location
    #   network_id                = module.vpc[0].network_id
    #   private_vpc_connection_id = module.vpc[0].access_connector_id
    #   project_id                = module.gcp_project[0].project_id
    # }
  }

  depends_on = [module.gcp_project, module.vpc]
}

module "postgresql_dbms_logs" {
  count  = length(module.postgresql_dbms) > 0 ? 1 : 0
  source = "../../../../libs/iac-modules/logger"
  log_map = {
    postgresql_dbms_provider = module.postgresql_dbms[0].provider
    username                 = module.postgresql_dbms[0].root_username
    password                 = module.postgresql_dbms[0].root_password
  }
}

resource "mongodbatlas_project" "instance" {
  count  = local.is_production_environment ? 1 : 0
  name   = var.environment_name
  org_id = var.mongodb_atlas_org_id

  is_collect_database_specifics_statistics_enabled = true
  is_data_explorer_enabled                         = true
  is_extended_storage_sizes_enabled                = true
  is_performance_advisor_enabled                   = true
  is_realtime_performance_panel_enabled            = true
  is_schema_advisor_enabled                        = true
}

resource "mongodbatlas_project_ip_access_list" "public" {
  project_id = mongodbatlas_project.instance[0].id
  cidr_block = "0.0.0.0/0" # Allow access from anywhere. TODO: Change this to a more secure value
  comment    = "CIDR Block to allow access from anywhere"
}

# Identity and Access Management (IAM) Service
module "kernel-security-iam-svc" {
  source            = "../../../kernel/security-iam-svc/iac"
  count             = local.is_production_environment ? 1 : 0 # Enabled in production environments only
  domain_name       = var.domain_name
  gcp_project_id    = module.gcp_project[0].project_id
  application_title = local.is_production_environment ? "Peerlab AC" : "Peerlab AC Preview ${module.gcp_project[0].project_id}"
  depends_on        = [module.gcp_project]
}

module "kernel-flag-management" {
  count                               = local.is_production_environment && length(module.postgresql_dbms) > 0 ? 0 : 0 # Enabled in production
  source                              = "../../../kernel/flag-management/iac"
  service_name                        = "kernel-flag-management"
  domain_name                         = var.domain_name
  branch_name                         = var.branch_name
  source_environment_branch_name      = var.source_environment_branch_name # Informs the type of environment in order to decide how to treat database and users
  environment_name                    = var.environment_name
  gcp_project_id                      = module.gcp_project[0].project_id
  gcp_shell_project_id                = var.gcp_shell_project_id
  gcp_location                        = var.gcp_location
  short_commit_sha                    = var.short_commit_sha
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  dbms_instance_host                  = module.postgresql_dbms[0].host
  nx_cloud_access_token               = var.nx_cloud_access_token
  gcp_dns_managed_zone_name           = var.gcp_dns_managed_zone_name
  gcp_vpc_access_connector_id         = module.vpc[0].access_connector_id # Necessary to stablish connection with database
  environment_path                    = var.environment_path
  dbms_provider = {
    # Switch back to Neon after https://github.com/kislerdm/terraform-provider-neon/issues/51 is fixed
    neon = {
      project_id = module.postgresql_dbms[0].dbms_provider_project_id
      branch_id  = module.postgresql_dbms[0].id
    }
    # gcp = {
    #   dbms_instance_name = module.postgresql_dbms[0].name
    #   project_id         = module.gcp_project[0].project_id
    # }
  }
  depends_on = [module.postgresql_dbms, module.gcp_project, module.vpc]
  # gcp_cloudbuildv2_repository_id      = var.gcp_cloudbuildv2_repository_id
}

output "kernel_flag_management_url" {
  description = "The url of the kernel-flag-management service"
  value       = length(module.kernel-flag-management) > 0 ? module.kernel-flag-management[0].url : ""
}

output "kernel_flag_management_admin_api_token" {
  description = "The admin api token of the kernel-flag-management service"
  value       = length(module.kernel-flag-management) > 0 ? module.kernel-flag-management[0].admin_api_token : ""
  sensitive   = true
}

# Organizations Management Microservice
module "people-organizations-management" {
  source                              = "../../../people/organizations-management/iac"
  count                               = local.is_production_environment && length(mongodbatlas_project.instance) > 0 ? 1 : 0 # Disable module in preview environments
  branch_name                         = var.branch_name
  source_environment_branch_name      = var.source_environment_branch_name # Informs the type of environment in order to decide how to treat database and users
  environment_name                    = var.environment_name
  gcp_project_id                      = module.gcp_project[0].project_id # Project where cloud run instances will be deployed
  gcp_shell_project_id                = var.gcp_shell_project_id         # Project where builds will be executed
  gcp_location                        = var.gcp_location
  short_commit_sha                    = var.short_commit_sha
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  nx_cloud_access_token               = var.nx_cloud_access_token
  domain_name                         = var.domain_name
  gcp_dns_managed_zone_name           = var.gcp_dns_managed_zone_name
  dbms_provider = {
    mongodb_atlas = {
      org_id     = var.mongodb_atlas_org_id
      project_id = mongodbatlas_project.instance[0].id
    }
  }
  depends_on = [mongodbatlas_project.instance, module.gcp_project]
}

# Researchers Peers Microservice
module "people-researchers-peers-svc" {
  source                              = "../../../people/researchers-peers-svc/iac"
  count                               = local.is_production_environment ? 0 : 0 # Disable module in preview environments
  branch_name                         = var.branch_name
  source_environment_branch_name      = var.source_environment_branch_name # Informs the type of environment in order to decide how to treat database and users
  environment_name                    = var.environment_name
  gcp_project_id                      = module.gcp_project[0].project_id # Project where cloud run instances will be deployed
  gcp_shell_project_id                = var.gcp_shell_project_id         # Project where builds will be executed
  gcp_location                        = var.gcp_location
  short_commit_sha                    = var.short_commit_sha
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  gcp_vpc_access_connector_id         = module.vpc[0].access_connector_id # Necessary to stablish connection with database
  nx_cloud_access_token               = var.nx_cloud_access_token
  dbms_instance_host                  = module.postgresql_dbms[0].host
  dbms_provider = {
    neon = {
      project_id = module.postgresql_dbms[0].dbms_provider_project_id
      branch_id  = module.postgresql_dbms[0].id
    }
    # gcp = {
    #   dbms_instance_name = module.postgresql_dbms[0].name
    #   project_id         = module.gcp_project[0].project_id
    # }
  }
  depends_on = [module.postgresql_dbms, module.gcp_project, mongodbatlas_project_ip_access_list.public]
  # gcp_cloudbuildv2_repository_id      = var.gcp_cloudbuildv2_repository_id
}

# Management Shell
module "kernel-management-shell-browser" {
  count                               = 1
  source                              = "../../../kernel/management-shell-browser/iac"
  docker_file_path                    = "apps/kernel/management-shell-browser/Dockerfile"
  docker_image_name                   = "kernel-management-shell-browser"
  domain_name                         = var.domain_name
  depends_on                          = [module.kernel-security-iam-svc, module.kernel-flag-management]
  is_production_environment           = local.is_production_environment
  source_environment_branch_name      = var.source_environment_branch_name
  gcp_shell_project_id                = var.gcp_shell_project_id
  gcp_project_id                      = module.gcp_project[0].project_id
  environment_name                    = var.environment_name
  branch_name                         = var.branch_name
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  gcp_location                        = var.gcp_location
  short_commit_sha                    = var.short_commit_sha
  gcp_dns_managed_zone_name           = var.gcp_dns_managed_zone_name
  source_environment_project_id       = var.production_environment_core_platform_shell_browser_vite_vercel_project_id

  environment_variables = {
    "VITE_FIREBASE_API_KEY"                                  = module.kernel-security-iam-svc[0].firebase_api_key
    "VITE_FIREBASE_AUTH_DOMAIN"                              = module.kernel-security-iam-svc[0].firebase_auth_domain
    "VITE_FIREBASE_PROJECT_ID"                               = module.kernel-security-iam-svc[0].firebase_project_id
    "VITE_FIREBASE_STORAGE_BUCKET"                           = module.kernel-security-iam-svc[0].firebase_storage_bucket
    "VITE_FIREBASE_MESSAGING_SENDER_ID"                      = module.kernel-security-iam-svc[0].firebase_messaging_sender_id
    "VITE_FIREBASE_APP_ID"                                   = module.kernel-security-iam-svc[0].firebase_app_id
    "VITE_PEOPLE_ORGANIZATIONS_MANAGEMENT_REST_API_BASE_URL" = module.people-organizations-management[0].rest_api_url
    "VITE_FEATURE_FLAG_AUTH_PROVIDER"                        = "firebase"
    "VITE_FEATURE_FLAG_MOCK_APIS_ENABLED"                    = "false"
    "VITE_FEATURE_FLAG_UNTITLED_SECTION_ENABLED"             = "false"
    "VITE_FEATURE_FLAG_CONCEPTS_SECTION_ENABLED"             = "false"
    "VITE_FEATURE_FLAG_PAGES_SECTION_ENABLED"                = "false"
    "VITE_FEATURE_FLAG_MISC_SECTION_ENABLED"                 = "false"
    "VITE_FEATURE_FLAG_PEER_547_GOOGLE_SSO_ENABLED"          = "true"
    # "VITE_UNLEASH_CLIENT_KEY"                                = "fake-client-key" # unleash_api_token.management-shell-browser.secret
    # "VITE_UNLEASH_FRONTEND_URL"                              = "${length(module.kernel-flag-management) > 0 ? module.kernel-flag-management[0].url : "https://fake-unleash-url.super.fake"}/api/frontend" # https://docs.getunleash.io/reference/sdks/react
  }
}

# # Docs
module "kernel-dev-docs-browser" {
  count                               = 1
  source                              = "../../../kernel/dev-docs-browser/iac"
  docker_file_path                    = "apps/kernel/dev-docs-browser/Dockerfile"
  service_name                        = "kernel-dev-docs-browser"
  domain_name                         = var.domain_name
  depends_on                          = [module.kernel-security-iam-svc, module.kernel-flag-management]
  is_production_environment           = local.is_production_environment
  source_environment_branch_name      = var.source_environment_branch_name
  gcp_shell_project_id                = var.gcp_shell_project_id
  gcp_project_id                      = module.gcp_project[0].project_id
  environment_name                    = var.environment_name
  branch_name                         = var.branch_name
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  gcp_location                        = var.gcp_location
  short_commit_sha                    = var.short_commit_sha
  gcp_dns_managed_zone_name           = var.gcp_dns_managed_zone_name
  source_environment_project_id       = var.production_environment_core_platform_shell_browser_vite_vercel_project_id
}
# module "kernel-dev-docs-browser" {
#   source                        = "../../../kernel/dev-docs-browser/iac"
#   is_service_enabled            = false
#   is_production_environment     = local.is_production_environment
#   branch_name                   = var.branch_name
#   source_environment_project_id = var.production_environment_dx_dev_docs_browser_vercel_project_id
#   depends_on                    = [module.people-researchers-peers-svc]
# }

# # Graph
# module "kernel-system-graph-browser" {
#   source                        = "../../../kernel/system-graph-browser/iac"
#   is_service_enabled            = false
#   is_production_environment     = local.is_production_environment
#   branch_name                   = var.branch_name
#   source_environment_project_id = var.production_environment_core_root_shell_graph_vercel_project_id
#   depends_on                    = [module.people-researchers-peers-svc]
# }
