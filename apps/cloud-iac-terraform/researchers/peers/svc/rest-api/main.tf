# Define local variables
locals {
  service_folder_path = "apps/researchers/peers/svc"     # The path to the Dockerfile from the root of the repository
  app_name            = "researchers-peers-svc-rest-api" # The name of the application
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

# This resource block defines a Google Cloud Build trigger that will react to pushes on the branch "staging"
resource "google_cloudbuild_trigger" "apps_researchers_peers" {
  # Name of the trigger
  name = "push-on-branch-staging"

  # Project ID where the trigger will be created
  project = var.project_id

  # Disable status of the trigger
  disabled = false

  # GitHub configuration
  github {
    # GitHub owner's username
    owner = var.repo_owner

    # Name of the source repository
    name = var.repo_name

    # Configuration for triggering on a push to a specific branch
    push {
      # Regex pattern for the branch name to trigger on
      branch = "^staging$"
    }
  }

  # Included files for the trigger
  included_files = ["entrypoints/run-researchers-peers-rest-api.sh", "apps/researchers/peers/**", "libs/researchers/peers/**", "package.json", "yarn.lock"]

  # Defines the build configuration
  build {

    options {
      # The type of machine to be used while building the Docker image
      machine_type = "E2_HIGHCPU_32"
    }

    # Each step in the build is represented as a list of commands
    step {
      # Name of the builder (the Docker image on Google Cloud) that will execute this build step
      name = "gcr.io/cloud-builders/docker"

      # Arguments to pass to the build step
      args = [
        "build",                                                         # Docker command to build an image from a Dockerfile
        "-t",                                                            # Tag the image with a name and optionally a tag in the 'name:tag' format
        "gcr.io/${var.project_id}/${local.app_name}:latest",             # Tag the image with the latest tag
        "-t",                                                            # Tag the image with a name and optionally a tag in the 'name:tag' format
        "gcr.io/${var.project_id}/${local.app_name}:${local.image_tag}", # Tag the image with the commit SHA
        "-f",                                                            # Name of the Dockerfile (Default is 'PATH/Dockerfile')
        "${local.service_folder_path}/Dockerfile",                       # Path to the Dockerfile
        ".",                                                             # The build context is the current directory
      ]
    }

    # # This step pushes the Docker image to GCR
    # step {
    #   # Name of the builder (the Docker image on Google Cloud) that will execute this build step
    #   name = "gcr.io/cloud-builders/docker"

    #   args = [
    #     "push",
    #     "gcr.io/${var.project_id}/${local.app_name}:latest",            # Push the image with the latest tag
    #     "gcr.io/${var.project_id}/${local.app_name}:${local.image_tag}" # Push the image with the commit SHA tag
    #   ]
    #   entrypoint = "bash"
    #   id         = "push-to-gcr"
    # }

    # # This step deploys the service to Cloud Run after the image is built
    # step {
    #   name = "gcr.io/cloud-builders/gcloud" # Specifies the Docker image that will be used to run this step.

    #   args = [
    #     "run",                                                           # Specifies that the gcloud command will interact with Cloud Run.
    #     "deploy",                                                        # Specifies that the operation to be performed is 'deploy'.
    #     local.app_name,                                                  # Passes the name of your application as the service name to be deployed.
    #     "--image",                                                       # Flag that specifies the Docker image to be deployed.
    #     "gcr.io/${var.project_id}/${local.app_name}:${local.image_tag}", # Specifies the Docker image to be deployed. This should be the image built in the previous steps.
    #     "--region",                                                      # Flag that specifies the region in which the service will be deployed.
    #     var.region,                                                      # Specifies the region to deploy the service to.
    #     "--platform",                                                    # Flag that specifies the target platform for deployment.
    #     "managed",                                                       # Specifies that the service will be deployed on the fully managed version of Cloud Run.
    #     "--allow-unauthenticated"                                        # Flag that specifies that the service can be invoked without providing credentials, meaning it's publicly accessible.
    #   ]
    # }

    # List of Docker images to be pushed to the registry upon successful completion of all build steps
    images = [
      "gcr.io/${var.project_id}/${local.app_name}:latest",            # Image with the latest tag
      "gcr.io/${var.project_id}/${local.app_name}:${local.image_tag}" # Image with the commit SHA tag
    ]
  }
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
        image = "gcr.io/${google_cloudbuild_trigger.apps_researchers_peers.project}/${local.app_name}:latest"

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

  # The service will be created after the Cloud Build trigger has completed
  depends_on = [google_cloudbuild_trigger.apps_researchers_peers]
}

# This block defines a Cloud Run IAM member. This sets the permissions for who can access the Cloud Run service.
resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.apps_researchers_peers.name     # The name of the service to which the IAM policy will be applied
  location = google_cloud_run_service.apps_researchers_peers.location # The location of the service to which the IAM policy will be applied
  role     = "roles/run.invoker"                                      # The role to be granted
  member   = "allUsers"                                               # The user, group, or service account who will have the role granted. In this case, all users.
}
