# Define local variables
locals {
  service_folder_path = "apps/researchers/peers/svc"     # The path to the Dockerfile from the root of the repository
  app_name            = "researchers-peers-svc-rest-api" # The name of the application
  commit_hash_file    = "${path.module}/.commit_hash"    # The file where the commit hash will be stored
}

# Fetch the current commit hash and write it to a file
resource "null_resource" "get_commit_hash" {
  provisioner "local-exec" {
    command = "git rev-parse HEAD > ${local.commit_hash_file}"
  }
}

# Read the commit hash from the file
data "local_file" "commit_hash" {
  filename   = local.commit_hash_file
  depends_on = [null_resource.get_commit_hash]
}

# Trim the commit hash and store it in a local variable (for use in cloud run)
locals {
  image_tag = trimspace(data.local_file.commit_hash.content)
}

# This block creates a new service account
resource "google_service_account" "researchers-peers-svc" {
  # The service account's identifier within the project
  account_id = local.app_name

  # The display name for the service account (optional)
  display_name = "Researchers Peers Service Account"

  # The ID of the project that the service account will be created in
  project = var.project_id
}

# This block adds the Secret Manager Secret Accessor role to the service account
resource "google_project_iam_binding" "secret_accessor" {
  # The ID of the project
  project = var.project_id

  # The role to be granted. "roles/secretmanager.secretAccessor" allows read access to Secret Manager secrets
  role = "roles/secretmanager.secretAccessor"

  # List of members (users, groups, service accounts, etc) that will be granted the role
  members = [
    # The service account to which the role will be granted
    "serviceAccount:${google_service_account.researchers-peers-svc.email}",
  ]

  depends_on = [google_service_account.researchers-peers-svc]
}

resource "google_project_iam_member" "service_account_user" {
  project    = var.project_id
  role       = "roles/iam.serviceAccountUser"
  member     = "serviceAccount:${google_service_account.researchers-peers-svc.email}"
  depends_on = [google_service_account.researchers-peers-svc]
}

# Assign the service account the Cloud Run Admin role
resource "google_project_iam_member" "run_admin" {
  project    = var.project_id
  role       = "roles/run.admin"
  member     = "serviceAccount:${google_service_account.researchers-peers-svc.email}"
  depends_on = [google_service_account.researchers-peers-svc]
}

# Assign the service account the Cloud Run Invoker role
resource "google_project_iam_member" "run_invoker" {
  project    = var.project_id
  role       = "roles/run.invoker"
  member     = "serviceAccount:${google_service_account.researchers-peers-svc.email}"
  depends_on = [google_service_account.researchers-peers-svc]
}

# Assign the service account the Cloud Build Editor role
resource "google_project_iam_member" "cloudbuild_editor" {
  project    = var.project_id
  role       = "roles/cloudbuild.builds.editor"
  member     = "serviceAccount:${google_service_account.researchers-peers-svc.email}"
  depends_on = [google_service_account.researchers-peers-svc]
}

# Create the Service Account Key
resource "google_service_account_key" "researchers-peers-svc-key" {
  service_account_id = google_service_account.researchers-peers-svc.name
  depends_on         = [google_service_account.researchers-peers-svc]
}

# Create the secret in Secret Manager
resource "google_secret_manager_secret" "researchers-peers-svc-secret" {
  secret_id = "researchers-peers-svc-secret"
  project   = var.project_id

  replication {
    automatic = true
  }
}

# Add the service account key as a secret version
resource "google_secret_manager_secret_version" "researchers-peers-svc-secret-v1" {
  secret      = google_secret_manager_secret.researchers-peers-svc-secret.id
  secret_data = base64encode(google_service_account_key.researchers-peers-svc-key.private_key)
}

# Fetch the service account key from Google Secret Manager
data "google_secret_manager_secret_version" "researchers-peers-svc_access_secret" {
  # The project in which the secret was created
  project = var.project_id

  # The secret_id corresponds to the name of the secret you created in Secret Manager
  secret = google_secret_manager_secret.researchers-peers-svc-secret.secret_id

  # The version of the secret to fetch. "latest" would fetch the latest version of the secret
  version = "latest"

  # Waits for the secret to be available
  depends_on = [google_secret_manager_secret_version.researchers-peers-svc-secret-v1]
}

# Create a secret in Google Secret Manager for the database URL
resource "google_secret_manager_secret" "database_url_secret" {
  secret_id = "database-url-secret" # Define the ID of the secret
  project   = var.project_id        # Define the project where the secret should be created

  replication {
    automatic = true # Ensure the secret is replicated across all regions
  }
}

# Add the database URL as a secret version
resource "google_secret_manager_secret_version" "database_url_secret_v1" {
  secret      = google_secret_manager_secret.database_url_secret.id # Link the secret version to the secret
  secret_data = var.database_url                                    # Set the value of the secret from the database_url variable
}

# Create a secret in Google Secret Manager for the direct URL
resource "google_secret_manager_secret" "direct_url_secret" {
  secret_id = "direct-url-secret" # Define the ID of the secret
  project   = var.project_id      # Define the project where the secret should be created

  replication {
    automatic = true # Ensure the secret is replicated across all regions
  }
}

# Add the direct URL as a secret version
resource "google_secret_manager_secret_version" "direct_url_secret_v1" {
  secret      = google_secret_manager_secret.direct_url_secret.id # Link the secret version to the secret
  secret_data = var.direct_url                                    # Set the value of the secret from the direct_url variable
}

# This block grants the 'Secret Manager Secret Accessor' role to the service account for the database URL secret
resource "google_secret_manager_secret_iam_member" "database_url_secret_accessor" {
  # The provider for the resource, in this case Google
  provider = google

  # The ID of the secret to which the role will be granted
  secret_id = google_secret_manager_secret.database_url_secret.id

  # The role to be granted. "roles/secretmanager.secretAccessor" allows read access to Secret Manager secrets
  role = "roles/secretmanager.secretAccessor"

  # The service account to which the role will be granted
  member = "serviceAccount:${google_service_account.researchers-peers-svc.email}"
}

# This block grants the 'Secret Manager Secret Accessor' role to the service account for the direct URL secret
resource "google_secret_manager_secret_iam_member" "direct_url_secret_accessor" {
  # The provider for the resource, in this case Google
  provider = google

  # The ID of the secret to which the role will be granted
  secret_id = google_secret_manager_secret.direct_url_secret.id

  # The role to be granted. "roles/secretmanager.secretAccessor" allows read access to Secret Manager secrets
  role = "roles/secretmanager.secretAccessor"

  # The service account to which the role will be granted
  member = "serviceAccount:${google_service_account.researchers-peers-svc.email}"
}

# This resource block defines a Google Cloud Run service. This service will host the Docker image created by the Google Cloud Build trigger.
resource "google_cloud_run_service" "apps_researchers_peers" {
  # Name of the service
  name = local.app_name

  # The region where the service will be located
  location = var.region

  # Defining the service template
  template {
    spec {
      # The service account to be used by the service
      service_account_name = google_service_account.researchers-peers-svc.email

      # The Docker image to use for the service
      containers {
        # The docker image is pulled from GCR using the project ID, app name and the image tag which corresponds to the commit hash
        image = "gcr.io/${var.project_id}/${local.app_name}:latest"

        # Set the ENTRYPOINT_PATH environment variable (check the Dockerfile for more details)
        env {
          name  = "ENTRYPOINT_PATH"
          value = "entrypoints/run-researchers-peers-svc-rest-api.sh"
        }

        # Set the DATABASE_URL environment variable from the database URL secret
        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.database_url_secret.secret_id # Reference the secret
              key  = "latest"                                                   # Use the latest version of the secret
            }
          }
        }

        # Set the DIRECT_URL environment variable from the direct URL secret
        env {
          name = "DIRECT_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.direct_url_secret.secret_id # Reference the secret
              key  = "latest"                                                 # Use the latest version of the secret
            }
          }
        }
      }
    }
  }

  # Defines the service traffic parameters
  traffic {
    # The percent of traffic this version of the service should receive
    percent = 100

    # Whether traffic should be directed to the latest revision
    latest_revision = true
  }
}

# This block defines a Cloud Run IAM member. This sets the permissions for who can access the Cloud Run service.
resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.apps_researchers_peers.name     # The name of the service to which the IAM policy will be applied
  location = google_cloud_run_service.apps_researchers_peers.location # The location of the service to which the IAM policy will be applied
  role     = "roles/run.invoker"                                      # The role to be granted
  member   = "allUsers"                                               # The user, group, or service account who will have the role granted. In this case, all users.
}
