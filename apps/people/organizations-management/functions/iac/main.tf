# This module requires the cloud build API to be enabled
locals {
  relative_root_path         = "../../../.."
  absolute_build_output_path = "dist/apps/people/organizations-management/functions"
  relative_build_output_path = "${local.relative_root_path}/${local.absolute_build_output_path}" # Path relative to apps/kernel/shell-iac/production/main.tf
}

locals {
  build_script = <<EOF
echo 'Building app...'
pnpm nx run ${var.service_component_name}:build --prod
echo 'Removing pnpm-lock.yaml from build output...'
# We need to remove pnpm-lock.yaml from the build output because it result in cloud function error during build (https://github.com/firebase/firebase-tools/issues/5911)
rm -f ${local.absolute_build_output_path}/pnpm-lock.yaml
EOF
}

module "nx_affected" {
  source           = "../../../../../libs/iac-modules/nx-affected"
  nx_project_name  = var.service_component_name
  short_commit_sha = var.short_commit_sha
  build_script     = local.build_script
}

module "zip_functions" {
  source           = "../../../../../libs/iac-modules/zip"
  zip_input_path   = local.relative_build_output_path
  short_commit_sha = var.short_commit_sha
  depends_on       = [module.nx_affected]
}

resource "random_id" "bucket_suffix" {
  byte_length = 2
}

resource "google_storage_bucket" "cloud_functions_bucket" {
  name     = "firebase-functions-source-${random_id.bucket_suffix.hex}"
  location = var.gcp_location
  project  = var.gcp_project_id
}

resource "google_storage_bucket_object" "people_organizations_management_functions_zip" {
  name       = "${var.service_component_name}-${var.short_commit_sha}.zip"
  bucket     = google_storage_bucket.cloud_functions_bucket.name
  source     = module.zip_functions.output_path
  depends_on = [module.nx_affected, module.zip_functions]
}

## Generation 2 is still in beta and does not support authentication triggers (https://cloud.google.com/functions/docs/calling/firebase-auth)
# resource "google_cloudfunctions2_function" "create_agent_v1_for_new_user_v1" {
#   name        = "createAgentV1WhenUserV1IsCreated"
#   description = "A function to create an agent v1 for every user v1 that is created"
#   location    = var.gcp_location
#   project     = var.gcp_project_id

#   build_config {
#     entry_point = "createAgentV1WhenUserV1IsCreated"
#     runtime     = "nodejs20"
#     source {
#       storage_source {
#         bucket = google_storage_bucket.cloud_functions_bucket.name
#         object = google_storage_bucket_object.people_organizations_management_functions_zip.name
#       }
#     }
#   }

#   service_config {
#     max_instance_count    = 1
#     available_memory      = "256M"
#     timeout_seconds       = 15
#     service_account_email = var.gcp_service_account_email

#     secret_environment_variables {
#       key        = "MONGODB_DATABASE_URI"
#       project_id = var.gcp_project_id
#       secret     = var.gcp_direct_database_connection_url_secret_id
#       version    = "latest"
#     }

#     environment_variables = {
#       MONGODB_DATABASE_NAME = "people-organizations-management"
#       DATABASE_PROVIDER     = "mongodb"
#     }
#   }
# }

resource "google_cloudfunctions_function" "functions" {
  depends_on = [module.nx_affected]
  for_each = {
    createAgentV1WhenUserV1IsCreated = {
      name        = "createAgentV1WhenUserV1IsCreated"
      description = "A function to create an agent v1 for every user v1 that is created in Firebase Authentication"
      event_type  = "providers/firebase.auth/eventTypes/user.create"
    }
    deleteAgentV1WhenUserV1IsDeleted = {
      name        = "deleteAgentV1WhenUserV1IsDeleted"
      description = "A function to delete an agent v1 for every user v1 that is deleted in Firebase Authentication"
      event_type  = "providers/firebase.auth/eventTypes/user.delete"
    }
  }

  event_trigger {
    event_type = each.value.event_type
    # We need to add "projects/" prefix in order to avoid running into  Error: googleapi: Error 400: event_trigger: Invalid trigger resource: invalid character/pattern in url (https://github.com/amaralc/peerlab/actions/runs/8218364971/job/22475148926)
    # According to https://cloud.google.com/functions/docs/calling/firebase-auth and https://github.com/hashicorp/terraform-provider-google/issues/8464#issuecomment-864092403 and https://github.com/firebase/firebase-tools/issues/5911
    resource = "projects/${var.gcp_project_id}"
  }

  name                  = each.value.name
  description           = each.value.description
  entry_point           = each.value.name
  region                = var.gcp_location
  project               = var.gcp_project_id
  runtime               = "nodejs20"
  max_instances         = 1
  min_instances         = 0
  timeout               = 15
  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.cloud_functions_bucket.name
  source_archive_object = google_storage_bucket_object.people_organizations_management_functions_zip.name
  service_account_email = var.gcp_service_account_email

  labels = {
    team              = "people"
    service           = "organizations-management"
    service_component = "functions"
  }

  secret_environment_variables {
    key        = "MONGODB_DATABASE_URI"
    project_id = var.gcp_project_id
    secret     = var.gcp_direct_database_connection_url_secret_id
    version    = "latest"
  }

  environment_variables = {
    MONGODB_DATABASE_NAME = "people-organizations-management"
    DATABASE_PROVIDER     = "mongodb"
  }
}
