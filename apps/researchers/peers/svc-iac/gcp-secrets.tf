locals {
  username             = neon_role.researchers-peers.name
  password             = neon_role.researchers-peers.password
  database_direct_host = var.neon_branch_host
  direct_host_parts    = split(".", local.database_direct_host)
  database_pooler_host = join(".", [format("%s-pooler", local.direct_host_parts[0]), join(".", slice(local.direct_host_parts, 1, length(local.direct_host_parts)))])
  database_name        = neon_database.researchers-peers.name

  database_direct_url = "postgres://${local.username}:${local.password}@${local.database_direct_host}/${local.database_name}"
  database_pooler_url = "postgres://${local.username}:${local.password}@${local.database_pooler_host}/${local.database_name}"
}


# Create the secret in Secret Manager
resource "google_secret_manager_secret" "researchers_peers_svc_secret" {
  secret_id = "${local.app_name}-${var.environment_name}-secret"
  project   = var.project_id

  replication {
    automatic = true
  }
}

# Add the service account key as a secret version
resource "google_secret_manager_secret_version" "researchers_peers_svc_secret-v1" {
  secret      = google_secret_manager_secret.researchers_peers_svc_secret.id
  secret_data = base64encode(google_service_account_key.researchers_peers_svc_key.private_key)
}

# Fetch the service account key from Google Secret Manager
data "google_secret_manager_secret_version" "researchers-peers-secret" {
  # The project in which the secret was created
  project = var.project_id

  # The secret_id corresponds to the name of the secret you created in Secret Manager
  secret = google_secret_manager_secret.researchers_peers_svc_secret.secret_id

  # The version of the secret to fetch. "latest" would fetch the latest version of the secret
  version = "latest"

  # Waits for the secret to be available
  depends_on = [google_secret_manager_secret_version.researchers_peers_svc_secret-v1]
}

# Create a secret in Google Secret Manager for the database URL
resource "google_secret_manager_secret" "gcp_pooled_database_connection_url_secret" {
  secret_id = "${local.app_name}-${var.environment_name}-pooled-database-connection-url-secret" # Define the ID of the secret
  project   = var.project_id                                                                    # Define the project where the secret should be created

  replication {
    automatic = true # Ensure the secret is replicated across all regions
  }
}

# Add the database URL as a secret version
resource "google_secret_manager_secret_version" "gcp_pooled_database_connection_url_secret_v1" {
  secret      = google_secret_manager_secret.gcp_pooled_database_connection_url_secret.id # Link the secret version to the secret
  secret_data = local.database_pooler_url                                                 # Set the value of the secret from the database_url variable
}

# Create a secret in Google Secret Manager for the direct URL
resource "google_secret_manager_secret" "gcp_direct_database_connection_url_secret" {
  secret_id = "${local.app_name}-${var.environment_name}-direct-database-connection-url-secret" # Define the ID of the secret
  project   = var.project_id                                                                    # Define the project where the secret should be created

  replication {
    automatic = true # Ensure the secret is replicated across all regions
  }
}

# Add the direct URL as a secret version
resource "google_secret_manager_secret_version" "gcp_direct_database_connection_url_secret_v1" {
  secret      = google_secret_manager_secret.gcp_direct_database_connection_url_secret.id # Link the secret version to the secret
  secret_data = local.database_direct_url                                                 # Set the value of the secret from the direct_url variable
}

# This block grants the 'Secret Manager Secret Accessor' role to the service account for the database URL secret
resource "google_secret_manager_secret_iam_member" "gcp_pooled_database_connection_url_secret_accessor" {
  # The provider for the resource, in this case Google
  provider = google

  # The ID of the secret to which the role will be granted
  secret_id = google_secret_manager_secret.gcp_pooled_database_connection_url_secret.id

  # The role to be granted. "roles/secretmanager.secretAccessor" allows read access to Secret Manager secrets
  role = "roles/secretmanager.secretAccessor"

  # The service account to which the role will be granted
  member = "serviceAccount:${google_service_account.researchers_peers_svc.email}"
}

# This block grants the 'Secret Manager Secret Accessor' role to the service account for the direct URL secret
resource "google_secret_manager_secret_iam_member" "gcp_direct_database_connection_url_secret_accessor" {
  # The provider for the resource, in this case Google
  provider = google

  # The ID of the secret to which the role will be granted
  secret_id = google_secret_manager_secret.gcp_direct_database_connection_url_secret.id

  # The role to be granted. "roles/secretmanager.secretAccessor" allows read access to Secret Manager secrets
  role = "roles/secretmanager.secretAccessor"

  # The service account to which the role will be granted
  member = "serviceAccount:${google_service_account.researchers_peers_svc.email}"
}
