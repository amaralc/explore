locals {
  service_name              = "people-organizations-management" # The name of the system component composed as "<team>-<service>"
  is_production_environment = var.source_environment_branch_name == null ? true : false
}

module "mongodb_instance" {
  source                     = "../../../../libs/iac-modules/mongodb-dbms-environment"
  count                      = local.is_production_environment ? 1 : 0 # Disabled module
  mongodb_dbms_instance_type = "SERVERLESS"
  instance_name              = local.service_name
  environment_name           = var.environment_name
  mongodb_atlas_project_id   = var.dbms_provider.mongodb_atlas.project_id
  mongodb_atlas_org_id       = var.dbms_provider.mongodb_atlas.org_id
}

module "mongodb_database_and_access_management" {
  source                         = "../../../../libs/iac-modules/service-with-mongodb-access"
  gcp_project_id                 = var.gcp_project_id
  service_name                   = local.service_name
  environment_name               = var.environment_name
  database_name                  = substr("${local.service_name}-${var.environment_name}", 0, 60)
  dbms_instance_host             = module.mongodb_instance[0].host
  short_commit_sha               = var.short_commit_sha
  source_environment_branch_name = var.source_environment_branch_name
  dbms_provider = {
    mongodb_atlas = {
      project_id                 = var.dbms_provider.mongodb_atlas.project_id
      connection_string_protocol = module.mongodb_instance[0].connection_protocol
      instance_type              = module.mongodb_instance[0].type
      instance_name              = module.mongodb_instance[0].name
    }
  }
}

# random suffix to prevent collisions
resource "random_id" "username_suffix" {
  byte_length = 8
}

locals {
  username = "${local.service_name}-${random_id.username_suffix.hex}"
}

module "rest_api_deployment" {
  count                                             = 1
  source                                            = "../rest-api/iac"
  service_component_name                            = "${local.service_name}-rest-api"
  gcp_location                                      = var.gcp_location
  gcp_project_id                                    = var.gcp_project_id
  gcp_shell_project_id                              = var.gcp_shell_project_id
  short_commit_sha                                  = var.short_commit_sha
  environment_name                                  = var.environment_name
  gcp_dns_managed_zone_name                         = var.gcp_dns_managed_zone_name
  domain_name                                       = var.domain_name
  is_production_environment                         = local.is_production_environment
  gcp_docker_artifact_repository_name               = var.gcp_docker_artifact_repository_name
  gcp_service_account_email                         = module.mongodb_database_and_access_management.service_account_email
  gcp_direct_database_connection_url_secret_id      = module.mongodb_database_and_access_management.database_url_secret_id
  gcp_direct_database_connection_url_secret_version = module.mongodb_database_and_access_management.database_url_secret_version
}

output "rest_api_url" {
  value = module.rest_api_deployment[0].url
}

module "functions_deployment" {
  count                                        = 1
  source                                       = "../functions/iac"
  service_component_name                       = "${local.service_name}-functions"
  short_commit_sha                             = var.short_commit_sha
  gcp_location                                 = var.gcp_location
  gcp_project_id                               = var.gcp_project_id
  gcp_direct_database_connection_url_secret_id = module.mongodb_database_and_access_management.database_url_secret_id
  gcp_service_account_email                    = module.mongodb_database_and_access_management.service_account_email
}
