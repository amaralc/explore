locals {
  is_production_environment = var.source_environment_branch_name == null ? true : false
  #   image_name   = "${var.gcp_location}-docker.pkg.dev/${var.gcp_shell_project_id}/${var.gcp_docker_artifact_repository_name}/${var.service_name}"
  #   build_script = <<EOF
  # echo "Building image..."
  # docker build -t ${local.image_name}:latest -t ${local.image_name}:${var.short_commit_sha} -f apps/kernel/flag-management/Dockerfile .

  # gcloud auth configure-docker ${var.gcp_location}-docker.pkg.dev
  # docker push ${local.image_name}:latest
  # docker push ${local.image_name}:${var.short_commit_sha}
  # EOF
}

# module "nx_affected_log" {
#   source           = "../../../../libs/iac-modules/nx-affected"
#   nx_project_name  = "kernel-flag-management"
#   short_commit_sha = var.short_commit_sha
#   build_script     = ""
# }

# module "nx_affected" {
#   source           = "../../../../libs/iac-modules/nx-affected"
#   nx_project_name  = "kernel-flag-management"
#   short_commit_sha = var.short_commit_sha
#   build_script     = local.build_script
#   depends_on       = [module.nx_affected_log]
# }

module "database_and_access_management" {
  source                         = "../../../../libs/iac-modules/service-with-postgresql-access"
  service_name                   = var.service_name
  environment_name               = var.environment_name
  dbms_instance_host             = var.dbms_instance_host
  gcp_project_id                 = var.gcp_project_id
  short_commit_sha               = var.short_commit_sha
  source_environment_branch_name = var.source_environment_branch_name
  dbms_provider                  = var.dbms_provider
  database_name                  = "unleash" # This provider requires the database name to be "unleash"
}

resource "random_password" "admin" {
  length  = 64
  special = false
}

locals {
  unleash_admin_api_token = "*:*.${random_password.admin.result}"
}

output "admin_api_token" {
  value     = local.unleash_admin_api_token
  sensitive = true
}

# This resource block defines a Google Cloud Run service. This service will host the Docker image created by the Google Cloud Build trigger.
resource "google_cloud_run_v2_service" "instance" {
  # # Dependencies
  depends_on = [
    module.database_and_access_management
    # module.nx_affected
  ]

  # GCP Project ID
  project = var.gcp_project_id

  # Name of the service
  name = substr("${var.service_name}", 0, 50)

  # The region where the service will be located
  location = var.gcp_location

  # Defining the service template
  template {
    # The name of the revision will be the commit hash
    revision = "${substr("${var.service_name}", 0, 50)}-${var.short_commit_sha}"

    # Sets the maximum number of requests that each serving instance can receive.
    max_instance_request_concurrency = 1000

    vpc_access {
      connector = var.gcp_vpc_access_connector_id
      egress    = "ALL_TRAFFIC"
    }

    scaling {
      # Maximum and minimum instances. Old "autoscaling.knative.dev" (https://cloud.google.com/run/docs/configuring/max-instances)
      max_instance_count = 1
      min_instance_count = 1
    }

    # The service account to be used by the service
    service_account = module.database_and_access_management.service_account_email

    containers {
      # Name of the container specified as a DNS_LABEL.
      name = var.service_name

      # The docker image is pulled from GCR using the project ID, app name and the image tag which corresponds to the commit hash
      image = "unleashorg/unleash-server:latest"
      # image = "${var.gcp_location}-docker.pkg.dev/${var.gcp_shell_project_id}/${var.gcp_docker_artifact_repository_name}/${var.service_name}:latest" # Use the environment to tag the image (staging, production, etc)

      ports {
        container_port = 4242
      }

      resources {
        limits = {
          # # CPU usage limit
          # # https://cloud.google.com/run/docs/configuring/cpu
          # cpu = "1000m" # 1 vCPU

          # Memory usage limit (per container)
          # https://cloud.google.com/run/docs/configuring/memory-limits
          memory = "1024Mi"
        }
      }

      # Set the KC_DB_URL environment variable from the direct URL secret
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = module.database_and_access_management.database_url_secret_id
            version = "latest"
          }
        }
      }

      # Reference
      # https://neon.tech/docs/connect/connect-securely
      # https://docs.getunleash.io/reference/deploy/configuring-unleash#enabling-self-signed-certificates
      # https://stackoverflow.com/questions/74204292/cloud-run-is-it-possible-to-connect-ssl-tls-database-server
      env {
        name  = "DATABASE_SSL"
        value = "false"
        # value = "{ \"rejectUnauthorized\": false, \"ca\": \"$(cat /etc/ssl/certs/ca-certificates.crt)\" }"
        # value = "{ \"ca\": \"$(cat /etc/ssl/certs/ca-certificates.crt)\" }"
      }

      env {
        name  = "LOG_LEVEL"
        value = "warn"
      }

      # env {
      #   name  = "INIT_FRONTEND_API_TOKENS"
      #   value = "default.development:frontend-fake-token,default.production:frontend-fake-token"
      #   # value = "default.development:frontend-${random_password.frontend_development.result},default.production:frontend-${random_password.frontend_production.result}"
      #   # value_source {
      #   #   secret_key_ref {
      #   #     secret  = module.service_secrets.secret_ids[0].secret_id
      #   #     version = "latest"
      #   #   }
      #   # }
      # }

      # env {
      #   name  = "INIT_CLIENT_API_TOKENS"
      #   value = "default.development:client-fake-token,default.production:client-fake-token"
      #   # value = "default.development:client-${random_password.client_development.result},default.production:client-${random_password.client_production.result}"
      #   # value_source {
      #   #   secret_key_ref {
      #   #     secret  = module.service_secrets.secret_ids[1].secret_id
      #   #     version = "latest"
      #   #   }
      #   # }
      # }

      env {
        name = "INIT_ADMIN_API_TOKENS"
        # https://github.com/amaralc/peerlab/actions/runs/6605693312/job/17941131523
        # https://github.com/Unleash/unleash/blob/main/src/lib/create-config.ts
        # https://github.com/search?q=repo%3AUnleash%2Funleash+rest.split%28%27.%27%29&type=code
        value = local.unleash_admin_api_token
      }
    }
  }

  # Defines the service traffic parameters
  traffic {
    # The percent of traffic this version of the service should receive
    percent = 100

    # Traffic type. Either latest or per revision. (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_v2_service#type)
    # type = "TRAFFIC_TARGET_ALLOCATION_TYPE_REVISION"
    type = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"

    # Revision to which to send this portion of traffic, if traffic allocation is by revision.
    # revision = "${substr("${var.service_name}", 0, 50)}-${var.short_commit_sha}"
  }
}

output "url" {
  value = google_cloud_run_v2_service.instance.uri
}

resource "null_resource" "set_flag_management_github_secrets" {
  depends_on = [google_cloud_run_v2_service.instance]

  triggers = {
    timestamp = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOF
echo "Saving flag management url and token..."
echo "unleash_api_url=${google_cloud_run_v2_service.instance.uri}/api" >> ${var.environment_path}
echo "unleash_auth_token=${local.unleash_admin_api_token}" >> ${var.environment_path}

echo "Log env..."
cat ${var.environment_path}
EOF
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

# Sets the domain name for the Cloud Run service.
# This part is taking too long to finish (see: https://issuetracker.google.com/issues/140611842?pli=1);
resource "google_cloud_run_domain_mapping" "default" {
  name       = local.is_production_environment ? "${var.service_name}.${var.domain_name}" : "${var.service_name}.${var.environment_name}.${var.domain_name}"
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
