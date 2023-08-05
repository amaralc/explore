locals {
  service_name = "security-iam-svc"
}

# Initialize firebase project
resource "google_firebase_project" "instance" {
  project  = var.gcp_project_id
  provider = google-beta
}

# Creates an Identity Platform config.
# Also enables Firebase Authentication with Identity Platform in the project if not.
resource "google_identity_platform_config" "auth" {
  provider = google-beta
  project  = var.gcp_project_id

  # For example, you can configure to auto-delete Anonymous users.
  autodelete_anonymous_users = true # TODO: check what this means
}

# Adds more configurations, like for the email/password sign-in provider.
resource "google_identity_platform_project_default_config" "auth" {
  provider = google-beta
  project  = var.gcp_project_id
  sign_in {
    allow_duplicate_emails = false

    anonymous {
      enabled = true # TODO: check what this means
    }

    email {
      enabled           = true
      password_required = false
    }
  }

  # Wait for Authentication to be initialized before enabling email/password.
  depends_on = [
    google_identity_platform_config.auth
  ]
}

# module "database_and_access_management" {
#   source                                = "../../../../libs/iac-modules/service-with-postgresql-access"
#   service_name                          = local.service_name
#   environment_name                      = var.environment_name
#   gcp_project_id                        = var.gcp_project_id
#   gcp_sql_dbms_instance_name            = var.gcp_sql_dbms_instance_name
#   gcp_sql_dbms_instance_host            = var.gcp_sql_dbms_instance_host
#   short_commit_sha                      = var.short_commit_sha
#   source_environment_branch_name        = var.source_environment_branch_name
#   gcp_sql_dbms_instance_connection_name = var.gcp_sql_dbms_instance_connection_name
# }

# module "cloud-run-instance" {
#   source                                          = "./cloud-run"
#   docker_image_name                               = local.service_name
#   environment_name                                = var.environment_name
#   gcp_location                                    = var.gcp_location
#   gcp_project_id                                  = var.gcp_project_id
#   short_commit_sha                                = var.short_commit_sha
#   gcp_vpc_access_connector_name                   = var.gcp_vpc_access_connector_name
#   gcp_docker_artifact_repository_name             = var.gcp_docker_artifact_repository_name
#   gcp_sql_dbms_instance_connection_name           = var.gcp_sql_dbms_instance_connection_name
#   gcp_service_account_email                       = module.database_and_access_management.service_account_email
#   gcp_jdbc_database_connection_url_secret_id      = module.database_and_access_management.jdbc_database_url_secret_id
#   gcp_jdbc_database_connection_url_secret_version = module.database_and_access_management.jdbc_database_url_secret_version
#   gcp_dbms_username_secret_id                     = module.database_and_access_management.dbms_username_secret_id
#   gcp_dbms_username_secret_version                = module.database_and_access_management.dbms_username_secret_version
#   gcp_dbms_password_secret_id                     = module.database_and_access_management.dbms_password_secret_id
#   gcp_dbms_password_secret_version                = module.database_and_access_management.dbms_password_secret_version
# }
