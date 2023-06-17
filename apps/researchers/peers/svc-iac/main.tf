locals {
  app_name           = "researchers-peers"
  app_component_name = "svc-rest-api"
}

# Peers Service
resource "neon_role" "researchers-peers" {
  name       = local.app_name
  project_id = var.project_id
  branch_id  = var.neon_branch_id
}

resource "neon_database" "researchers-peers" {
  name       = local.app_name
  project_id = var.project_id
  branch_id  = var.neon_branch_id
  owner_name = neon_role.researchers-peers.name
}

# Researchers Peers Service REST API instance
module "researchers-peers-svc-rest-api" {
  source                                            = "../svc-rest-api/iac"                                                                # The path to the module
  app_name                                          = local.app_name                                                                       # The name of the application
  app_component_name                                = local.app_component_name                                                             # The name of the application component
  environment_name                                  = var.environment_name                                                                 # The deployment environment (staging | production)
  project_id                                        = var.project_id                                                                       # The Google Cloud project ID
  region                                            = var.region                                                                           # The region where resources will be created
  commit_hash                                       = var.commit_hash                                                                      # The commit hash of the source code to deploy
  gcp_docker_artifact_repository_name               = var.gcp_docker_artifact_repository_name                                              # The name of the Docker repository
  gcp_service_account_email                         = google_service_account.researchers_peers_svc.email                                   # The email of the GCP Service Account
  gcp_direct_database_connection_url_secret_id      = google_secret_manager_secret.gcp_direct_database_connection_url_secret.secret_id     # The ID of the database connection URL secret
  gcp_pooled_database_connection_url_secret_id      = google_secret_manager_secret.gcp_pooled_database_connection_url_secret.secret_id     # The ID of the database connection URL secret
  gcp_direct_database_connection_url_secret_version = google_secret_manager_secret_version.gcp_direct_database_connection_url_secret_v1.id # The id of the version of the database connection URL secret
  gcp_pooled_database_connection_url_secret_version = google_secret_manager_secret_version.gcp_pooled_database_connection_url_secret_v1.id # The id of the version of the database connection URL secret
  credentials_path                                  = var.credentials_path
}
