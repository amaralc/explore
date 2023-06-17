# This resource block defines a Google Cloud Run service. This service will host the Docker image created by the Google Cloud Build trigger.
resource "google_cloud_run_service" "apps_researchers_peers_rest_api" {
  # Name of the service
  name = "${var.app_name}-${var.app_component_name}-${var.commit_hash}" # Use the commit hash to force a new revision to be created

  # The region where the service will be located
  location = var.region

  # Defining the service template
  template {
    spec {
      # The service account to be used by the service
      service_account_name = var.gcp_service_account_email

      # The Docker image to use for the service
      containers {
        # The docker image is pulled from GCR using the project ID, app name and the image tag which corresponds to the commit hash
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.gcp_docker_artifact_repository_name}/${var.app_name}-${var.app_component_name}:${var.environment}" # Use the environment to tag the image (staging, production, etc)

        # Set the ENTRYPOINT_PATH environment variable (check the Dockerfile for more details)
        env {
          name  = "ENTRYPOINT_PATH"
          value = "entrypoints/run-${var.app_name}-${var.app_component_name}.sh"
        }

        # Set the POSTGRES_POOLED_CONNECTION_DATABASE_URL environment variable from the database URL secret
        env {
          name = "POSTGRES_POOLED_CONNECTION_DATABASE_URL"
          value_from {
            secret_key_ref {
              name = var.gcp_pooled_database_connection_url_secret_id # Reference the secret
              key  = "latest"                                         # Use the latest version of the secret
            }
          }
        }

        # Set the POSTGRES_DIRECT_CONNECTION_DATABASE_URL environment variable from the direct URL secret
        env {
          name = "POSTGRES_DIRECT_CONNECTION_DATABASE_URL"
          value_from {
            secret_key_ref {
              name = var.gcp_direct_database_connection_url_secret_id # Reference the secret
              key  = "latest"                                         # Use the latest version of the secret
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

# # This block defines a Cloud Run IAM member. This sets the permissions for who can access the Cloud Run service.
# resource "google_cloud_run_service_iam_member" "public" {
#   service  = google_cloud_run_service.apps_researchers_peers_rest_api.name     # The name of the service to which the IAM policy will be applied
#   location = google_cloud_run_service.apps_researchers_peers_rest_api.location # The location of the service to which the IAM policy will be applied
#   role     = "roles/run.invoker"                                               # The role to be granted
#   member   = "allUsers"                                                        # The user, group, or service account who will have the role granted. In this case, all users.
# }
