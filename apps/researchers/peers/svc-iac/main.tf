locals {
  app_name           = "researchers-peers"
  app_component_name = "svc-rest-api"
}

# Create database and user for the application
module "database_access" {
  source                     = "../../../core/platform-shell-iac/modules/gcp-sql-user-and-database"
  service_name               = local.app_name
  gcp_sql_dbms_instance_name = var.gcp_sql_dbms_instance_name
}

module "service_account_with_roles" {
  source               = "../../../core/platform-shell-iac/modules/gcp-service-account-with-roles" // path to the module
  service_account_name = local.app_name
  gcp_project_id       = var.gcp_project_id
  gcp_roles = [
    "roles/secretmanager.secretAccessor",
    "roles/iam.serviceAccountUser",
    "roles/run.admin",
    "roles/run.invoker",
    "roles/cloudsql.client"
  ]
}

locals {
  username      = module.database_access.user.name
  password      = module.database_access.user.password
  database_name = module.database_access.database.name
  host          = var.gcp_sql_dbms_instance_host
  port          = "5432"
  # username      = "fake-username"
  # password      = "fake-password"
  # database_name = "fake-database-name"
  # connection_name = var.gcp_sql_database_instance_connection_name
  # connection_name = "fake-connection-name"
  # database_host   = "fake-database-host"

  # References:
  # https://stackoverflow.com/questions/68018718/terraform-google-cloud-run-add-cloud-sql-connection
  # https://github.com/hashicorp/terraform-provider-google/issues/6004#issuecomment-607282371
  database_pooler_url = "postgres://${local.username}:${local.password}@${local.host}:${local.port}/${local.database_name}"
  database_direct_url = "postgres://${local.username}:${local.password}@${local.host}:${local.port}/${local.database_name}" # How to appropriately set pooler in cloud sql?
}

module "service_secrets" {
  source         = "../../../core/platform-shell-iac/modules/gcp-secrets"
  gcp_project_id = var.gcp_project_id
  secrets = [
    {
      name  = "database_pooler_url"
      value = local.database_pooler_url
    },
    {
      name  = "database_direct_url"
      value = local.database_direct_url
    }
  ]
}

# # Researchers Peers Service REST API instance
# module "researchers-peers-svc-rest-api" {
#   source                                            = "../svc-rest-api/iac" # The path to the module
#   credentials_path                                  = var.gcp_credentials_file_path
#   app_name                                          = local.app_name                                                                       # The name of the application
#   app_component_name                                = local.app_component_name                                                             # The name of the application component
#   environment_name                                  = var.environment_name                                                                 # The deployment environment (staging | production)
#   project_id                                        = var.project_id                                                                       # The Google Cloud project ID
#   region                                            = var.region                                                                           # The region where resources will be created
#   commit_hash                                       = var.commit_hash                                                                      # The commit hash of the source code to deploy
#   gcp_docker_artifact_repository_name               = var.gcp_docker_artifact_repository_name                                              # The name of the Docker repository
#   gcp_service_account_email                         = google_service_account.researchers_peers_svc.email                                   # The email of the GCP Service Account
#   gcp_sql_database_instance_connection_name         = var.gcp_sql_database_instance_connection_name                                        # The name of the database connection
#   gcp_direct_database_connection_url_secret_id      = google_secret_manager_secret.gcp_direct_database_connection_url_secret.secret_id     # The ID of the database connection URL secret
#   gcp_pooled_database_connection_url_secret_id      = google_secret_manager_secret.gcp_pooled_database_connection_url_secret.secret_id     # The ID of the database connection URL secret
#   gcp_direct_database_connection_url_secret_version = google_secret_manager_secret_version.gcp_direct_database_connection_url_secret_v1.id # The id of the version of the database connection URL secret
#   gcp_pooled_database_connection_url_secret_version = google_secret_manager_secret_version.gcp_pooled_database_connection_url_secret_v1.id # The id of the version of the database connection URL secret
#   database_direct_url                               = local.database_direct_url
#   database_pooler_url                               = local.database_pooler_url
#   gcp_sql_database_instance_name                    = var.gcp_sql_database_instance_name
#   gcp_vpc_access_connector_name                     = var.gcp_vpc_access_connector_name
# }
