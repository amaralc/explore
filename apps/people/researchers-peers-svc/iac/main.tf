locals {
  service_name              = "people-researchers-peers-svc"
  is_production_environment = var.source_environment_branch_name == null ? true : false
}

module "database_and_access_management" {
  source                         = "../../../../libs/iac-modules/service-with-postgresql-access"
  gcp_project_id                 = var.gcp_project_id
  service_name                   = local.service_name
  environment_name               = var.environment_name
  database_name                  = substr("${local.service_name}-${var.environment_name}", 0, 60)
  dbms_instance_host             = var.dbms_instance_host
  short_commit_sha               = var.short_commit_sha
  source_environment_branch_name = var.source_environment_branch_name
  dbms_provider                  = var.dbms_provider
}

# module "rest_api_deployment" {
#   count                                             = 1
#   source                                            = "../rest-api/iac/deployment"
#   docker_image_name                                 = "${local.service_name}-rest-api"
#   gcp_location                                      = var.gcp_location
#   gcp_project_id                                    = var.gcp_project_id
#   gcp_shell_project_id                              = var.gcp_shell_project_id
#   short_commit_sha                                  = var.short_commit_sha
#   environment_name                                  = var.environment_name
#   gcp_docker_artifact_repository_name               = var.gcp_docker_artifact_repository_name
#   gcp_vpc_access_connector_name                     = var.gcp_vpc_access_connector_id
#   gcp_service_account_email                         = module.database_and_access_management.service_account_email
#   gcp_direct_database_connection_url_secret_id      = module.database_and_access_management.database_url_secret_id
#   gcp_direct_database_connection_url_secret_version = module.database_and_access_management.database_url_secret_version
#   gcp_pooled_database_connection_url_secret_id      = module.database_and_access_management.database_url_secret_id
#   gcp_pooled_database_connection_url_secret_version = module.database_and_access_management.database_url_secret_version
# }
