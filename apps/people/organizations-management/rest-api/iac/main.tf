locals {
  image_name   = "${var.gcp_location}-docker.pkg.dev/${var.gcp_shell_project_id}/${var.gcp_docker_artifact_repository_name}/${var.service_component_name}"
  build_script = <<EOF
echo 'Building app...'
pnpm nx run ${var.service_component_name}:build --prod

echo "Building image..."
docker build -t ${local.image_name}:latest -t ${local.image_name}:${var.short_commit_sha} -f apps/people/organizations-management/rest-api/Dockerfile .

gcloud auth configure-docker ${var.gcp_location}-docker.pkg.dev
docker push ${local.image_name}:latest
docker push ${local.image_name}:${var.short_commit_sha}
EOF
}

module "nx_affected_log" {
  source           = "../../../../../libs/iac-modules/nx-affected"
  nx_project_name  = var.service_component_name
  short_commit_sha = var.short_commit_sha
  build_script     = ""
}

module "nx_affected" {
  source           = "../../../../../libs/iac-modules/nx-affected"
  nx_project_name  = var.service_component_name
  short_commit_sha = var.short_commit_sha
  build_script     = local.build_script
  depends_on       = [module.nx_affected_log]
}

# This resource block defines a Google Cloud Run service. This service will host the Docker image created by the Google Cloud Build trigger.
resource "google_cloud_run_v2_service" "instance" {
  # GCP Project ID
  project = var.gcp_project_id

  # Name of the service
  name = substr("${var.service_component_name}", 0, 50) # Use the commit hash to force a new revision to be created. Only lowercase, digits, and hyphens; must begin with letter, and may not end with hyphen; must be less than 64 characters

  # The region where the service will be located
  location = var.gcp_location

  # Depends on secret versions
  # depends_on = [docker_registry_image.image]
  # depends_on = [docker_registry_image.latest]
  depends_on = [module.nx_affected]


  # Defining the service template
  template {
    # The name of the revision will be the commit hash
    revision = "${substr("${var.service_component_name}", 0, 50)}-${var.short_commit_sha}"

    # Sets the maximum number of requests that each serving instance can receive.
    max_instance_request_concurrency = 1000

    scaling {
      # Maximum and minimum instances. Old "autoscaling.knative.dev" (https://cloud.google.com/run/docs/configuring/max-instances)
      max_instance_count = 1
      min_instance_count = 0
    }

    # The service account to be used by the service
    service_account = var.gcp_service_account_email

    # The Docker image to use for the service
    containers {
      # Name of the container specified as a DNS_LABEL.
      name = var.service_component_name

      # The docker image is pulled from GCR using the project ID, app name and the image tag which corresponds to the commit hash
      image = "${var.gcp_location}-docker.pkg.dev/${var.gcp_shell_project_id}/${var.gcp_docker_artifact_repository_name}/${var.service_component_name}:latest" # Use the environment to tag the image (staging, production, etc)
      # image = docker_registry_image.image.name # Use the environment to tag the image (staging, production, etc)

      env {
        name  = "ENTRYPOINT_PATH"
        value = "apps/people/organizations-management/rest-api/entrypoint.sh"
      }

      env {
        name  = "MONGODB_DATABASE_NAME"
        value = "people-organizations-management"
      }

      env {
        name  = "DATABASE_PROVIDER"
        value = "mongodb"
      }

      # Set the POSTGRES_DIRECT_CONNECTION_DATABASE_URL environment variable from the direct URL secret
      env {
        name = "MONGODB_DATABASE_URI"
        value_source {
          secret_key_ref {
            secret  = var.gcp_direct_database_connection_url_secret_id # Reference the secret
            version = "latest"
          }
        }
      }

      ports {
        container_port = 80
      }
    }
  }

  # Defines the service traffic parameters
  traffic {
    # The percent of traffic this version of the service should receive
    percent = 100

    # Traffic type. Either latest or per revision. (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_v2_service#type)
    type = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"

  }
}

# This block defines a Cloud Run IAM member. This sets the permissions for who can access the Cloud Run service.
resource "google_cloud_run_service_iam_member" "public" {
  project  = var.gcp_project_id
  service  = google_cloud_run_v2_service.instance.name     # The name of the service to which the IAM policy will be applied
  location = google_cloud_run_v2_service.instance.location # The location of the service to which the IAM policy will be applied
  role     = "roles/run.invoker"                           # The role to be granted
  member   = "allUsers"                                    # The user, group, or service account who will have the role granted. In this case, all users.
}

locals {
  service_domain = var.is_production_environment ? "${var.service_component_name}.${var.domain_name}" : "${var.service_component_name}.${var.environment_name}.${var.domain_name}"
}


# Sets the domain name for the Cloud Run service.
# This part is taking too long to finish (see: https://issuetracker.google.com/issues/140611842?pli=1);
resource "google_cloud_run_domain_mapping" "default" {
  name       = local.service_domain
  project    = var.gcp_project_id
  location   = google_cloud_run_v2_service.instance.location # "europe-west1" # https://cloud.google.com/run/docs/locations#domains
  depends_on = [google_cloud_run_v2_service.instance]

  metadata {
    namespace = var.gcp_project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.instance.name
  }
}

# Set DNS records
resource "google_dns_record_set" "cname_record" {
  depends_on   = [google_cloud_run_v2_service.instance]
  project      = var.gcp_shell_project_id
  managed_zone = var.gcp_dns_managed_zone_name
  name         = "${google_cloud_run_domain_mapping.default.status[0].resource_records[0].name}.${var.domain_name}."
  type         = google_cloud_run_domain_mapping.default.status[0].resource_records[0].type
  ttl          = 60
  rrdatas      = [google_cloud_run_domain_mapping.default.status[0].resource_records[0].rrdata]
}

output "url" {
  value = "${google_cloud_run_domain_mapping.default.status[0].resource_records[0].name}.${var.domain_name}"
}

