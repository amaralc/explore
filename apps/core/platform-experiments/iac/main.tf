locals {
  service_name = "core-platform-experiments"
}

module "database_and_access_management" {
  source                                = "../../../../libs/iac-modules/service-with-postgresql-access"
  service_name                          = local.service_name
  environment_name                      = var.environment_name
  gcp_project_id                        = var.gcp_project_id
  gcp_sql_dbms_instance_name            = var.gcp_sql_dbms_instance_name
  gcp_sql_dbms_instance_host            = var.gcp_sql_dbms_instance_host
  short_commit_sha                      = var.short_commit_sha
  source_environment_branch_name        = var.source_environment_branch_name
  gcp_sql_dbms_instance_connection_name = var.gcp_sql_dbms_instance_connection_name
}

module "cloud-run-instance" {
  source                                     = "./cloud-run"
  docker_image_name                          = local.service_name
  environment_name                           = var.environment_name
  gcp_location                               = var.gcp_location
  gcp_project_id                             = var.gcp_project_id
  short_commit_sha                           = var.short_commit_sha
  gcp_vpc_access_connector_name              = var.gcp_vpc_access_connector_name
  gcp_docker_artifact_repository_name        = var.gcp_docker_artifact_repository_name
  gcp_sql_dbms_instance_connection_name      = var.gcp_sql_dbms_instance_connection_name
  gcp_service_account_email                  = module.database_and_access_management.service_account_email
  gcp_database_connection_url_secret_id      = module.database_and_access_management.database_url_secret_id
  gcp_database_connection_url_secret_version = module.database_and_access_management.database_url_secret_version
}

output "service_url" {
  description = "The URL of the service"
  value       = module.cloud-run-instance.url
}

provider "unleash" {
  alias      = "dynamic"
  auth_token = "default:development.unleash-insecure-api-token"
  api_url    = module.cloud-run-instance.url
}

module "unleash-state" {
  source           = "./unleash"
  environment_name = var.environment_name

  providers = {
    "unleash" = unleash.dynamic # Use the dynamic provider (https://developer.hashicorp.com/terraform/language/meta-arguments/resource-provider)
  }
}


