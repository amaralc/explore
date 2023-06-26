locals {
  service_name = "researchers-peers"
}

# Create database for the service
module "database" {
  source                     = "../../../../libs/iac-modules/gcp-postgresql-dbms-database"
  count                      = var.source_environment_branch_name == null ? 1 : 0 # Create database only if it is not a preview environment. For preview environments, the existing databases were already cloned from source environment
  gcp_sql_dbms_instance_name = var.gcp_sql_dbms_instance_name
  database_name              = local.service_name
}

# Create DBMS user for the service
module "user" {
  source                     = "../../../../libs/iac-modules/gcp-postgresql-dbms-user"
  username                   = "${local.service_name}-${var.environment_name}" # Since users are duplicated from source environment, we added the environment as part of the username
  gcp_sql_dbms_instance_name = var.gcp_sql_dbms_instance_name
}

# Create local variables to simplify the creation of the database connection URL secrets
locals {
  username      = module.user.username
  password      = module.user.password
  database_name = local.service_name
  host          = var.gcp_sql_dbms_instance_host
  port          = "5432"

  # References:
  # https://stackoverflow.com/questions/68018718/terraform-google-cloud-run-add-cloud-sql-connection
  # https://github.com/hashicorp/terraform-provider-google/issues/6004#issuecomment-607282371
  database_pooler_url = "postgres://${local.username}:${local.password}@${local.host}:${local.port}/${local.database_name}"
  database_direct_url = "postgres://${local.username}:${local.password}@${local.host}:${local.port}/${local.database_name}" # How to appropriately set pooler in cloud sql?
}

# Create database connection URL secrets
module "service_secrets" {
  source         = "../../../../libs/iac-modules/gcp-secrets"
  gcp_project_id = var.gcp_project_id
  secrets = [
    {
      name  = "database_pooler_url_${local.service_name}_${var.environment_name}"
      value = local.database_pooler_url # I'm not sure why syntax highlighting is not working here
    },
    {
      name  = "database_direct_url_${local.service_name}_${var.environment_name}"
      value = local.database_direct_url # I'm not sure why syntax highlighting is not working here
    }
  ]
}

# Create service account
module "service_account" {
  source               = "../../../../libs/iac-modules/gcp-service-account"
  gcp_project_id       = var.gcp_project_id
  service_account_name = substr("${local.service_name}-${var.environment_name}", 0, 30)
}

# Add permissions to service account
module "service_account_permissions" {
  source                = "../../../../libs/iac-modules/gcp-service-account-permissions" // path to the module
  gcp_project_id        = var.gcp_project_id
  service_account_email = module.service_account.instance.email
  gcp_roles = [
    "roles/secretmanager.secretAccessor",
    "roles/iam.serviceAccountUser",
    "roles/run.admin",
    "roles/run.invoker",
    "roles/cloudsql.client"
  ]
}

# # # Researchers Peers Service REST API instance
# module "rest-api" {
#   source                                            = "../svc-rest-api/iac/run" # The path to the module
#   docker_image_name                                 = "${local.service_name}-svc-rest-api"
#   gcp_location                                      = var.gcp_location
#   gcp_project_id                                    = var.gcp_project_id
#   short_commit_sha                                  = var.short_commit_sha
#   environment_name                                  = var.environment_name
#   gcp_service_account_email                         = module.service_account.instance.email
#   gcp_docker_artifact_repository_name               = var.gcp_docker_artifact_repository_name
#   gcp_vpc_access_connector_name                     = var.gcp_vpc_access_connector_name
#   gcp_direct_database_connection_url_secret_id      = module.service_secrets.secret_ids[0].secret_id
#   gcp_direct_database_connection_url_secret_version = module.service_secrets.secrets_versions[0].version_id
#   gcp_pooled_database_connection_url_secret_id      = module.service_secrets.secret_ids[1].secret_id
#   gcp_pooled_database_connection_url_secret_version = module.service_secrets.secrets_versions[1].version_id
#   depends_on                                        = [module.service_account, module.service_account_permissions, module.database, module.user, module.service_secrets]
# }

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
