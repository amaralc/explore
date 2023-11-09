resource "unleash_api_token" "management-shell-browser" {
  username    = "admin"
  type        = "frontend"
  expires_at  = "2023-11-25T00:00:00Z"
  environment = var.is_production_environment ? "production" : "development"
  projects    = ["default"]
}

resource "unleash_feature_v2" "with_env_strategies" {
  name               = "PEER_547_GOOGLE_SSO_ENABLED"
  description        = "Weather or not to enable Google SSO"
  type               = "release"
  project_id         = "default"
  archive_on_destroy = false

  environment {
    name    = "production"
    enabled = false
  }

  environment {
    name    = "development"
    enabled = true

    strategy {
      name = "remoteAddress"
      parameters = {
        IPs = "189.434.777.123,host.test.com"
      }
    }
    strategy {
      name = "flexibleRollout"
      parameters = {
        rollout    = "68"
        stickiness = "random"
        groupId    = "toggle"
      }
    }
  }

  tag {
    type  = "simple"
    value = var.docker_image_name
  }
}

locals {
  # Variables defined within module
  module_environment_variables = {
    VITE_UNLEASH_CLIENT_KEY = unleash_api_token.management-shell-browser.secret
  }

  # Variables defined outside module
  external_environment_variables = var.environment_variables

  # Resulting environment variables
  env_file_content = join("\n", [
    for key, value in merge(var.environment_variables, local.module_environment_variables) : "${key}=${value}"
  ])
}

# Create .env file in project's folder
resource "local_file" "env_file" {
  content  = local.env_file_content
  filename = "${path.cwd}/../../../../apps/kernel/management-shell-browser/.env"
}

locals {
  image_name   = "${var.gcp_location}-docker.pkg.dev/${var.gcp_shell_project_id}/${var.gcp_docker_artifact_repository_name}/${var.docker_image_name}"
  build_script = <<EOF
echo 'Building app...'
pnpm nx run kernel-management-shell-browser:build --prod

echo "Building image..."
docker build -t ${local.image_name}:latest -t ${local.image_name}:${var.short_commit_sha} -f apps/kernel/management-shell-browser/Dockerfile .

gcloud auth configure-docker ${var.gcp_location}-docker.pkg.dev
docker push ${local.image_name}:latest
docker push ${local.image_name}:${var.short_commit_sha}
EOF
}

module "nx_affected_log" {
  source           = "../../../../libs/iac-modules/nx-affected"
  nx_project_name  = "kernel-management-shell-browser"
  short_commit_sha = var.short_commit_sha
  build_script     = ""
}

module "nx_affected" {
  source           = "../../../../libs/iac-modules/nx-affected"
  nx_project_name  = "kernel-management-shell-browser"
  short_commit_sha = var.short_commit_sha
  build_script     = local.build_script
  depends_on       = [module.nx_affected_log]
}

module "service_account" {
  source                    = "../../../../libs/iac-modules/gcp-service-account"
  gcp_project_id            = var.gcp_project_id
  service_name              = var.docker_image_name
  environment_name          = substr(var.environment_name, 0, 63)
  short_commit_sha          = var.short_commit_sha
  is_production_environment = var.source_environment_branch_name == null ? true : false
}

# Add permissions to service account
module "service_account_permissions" {
  source              = "../../../../libs/iac-modules/gcp-account-permissions" // path to the module
  gcp_project_id      = var.gcp_project_id
  account_email       = module.service_account.instance.email
  account_member_type = "serviceAccount"
  gcp_roles = [
    "roles/iam.serviceAccountUser",
    "roles/run.admin",
    "roles/run.invoker",
  ]
}

# This resource block defines a Google Cloud Run service. This service will host the Docker image created by the Google Cloud Build trigger.
resource "google_cloud_run_v2_service" "instance" {
  # GCP Project ID
  project = var.gcp_project_id

  # Name of the service
  name = substr("${var.docker_image_name}", 0, 50) # Use the commit hash to force a new revision to be created. Only lowercase, digits, and hyphens; must begin with letter, and may not end with hyphen; must be less than 64 characters

  # The region where the service will be located
  location = "europe-west1" # var.gcp_location

  # Depends on secret versions
  # depends_on = [docker_registry_image.image]
  # depends_on = [docker_registry_image.latest]
  depends_on = [module.nx_affected]


  # Defining the service template
  template {
    # The name of the revision will be the commit hash
    revision = "${substr("${var.docker_image_name}", 0, 50)}-${var.short_commit_sha}"

    # Sets the maximum number of requests that each serving instance can receive.
    max_instance_request_concurrency = 1000

    scaling {
      # Maximum and minimum instances. Old "autoscaling.knative.dev" (https://cloud.google.com/run/docs/configuring/max-instances)
      max_instance_count = 1
      min_instance_count = 1
    }

    # The service account to be used by the service
    service_account = module.service_account.instance.email

    # The Docker image to use for the service
    containers {
      # Name of the container specified as a DNS_LABEL.
      name = var.docker_image_name

      # The docker image is pulled from GCR using the project ID, app name and the image tag which corresponds to the commit hash
      image = "${var.gcp_location}-docker.pkg.dev/${var.gcp_shell_project_id}/${var.gcp_docker_artifact_repository_name}/${var.docker_image_name}:latest" # Use the environment to tag the image (staging, production, etc)
      # image = docker_registry_image.image.name # Use the environment to tag the image (staging, production, etc)

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
  service_domain = var.is_production_environment ? "${var.docker_image_name}.${var.domain_name}" : "${var.docker_image_name}.${var.environment_name}.${var.domain_name}"
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
