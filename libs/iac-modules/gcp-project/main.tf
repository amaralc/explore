# Generate a random ID with the random_id resource. This ID will be used as prefix to create a unique project ID for the new GCP project.
resource "random_id" "instance" {
  byte_length = 8
}

# The null_resource with lifecycle block and ignore_changes argument is used to ensure that the random ID does not change in subsequent runs.
resource "null_resource" "ignore_id_changes" {
  triggers = {
    id = random_id.instance.hex
  }

  lifecycle {
    ignore_changes = [
      triggers,
    ]
  }
}

locals {
  project_id = "${substr("${var.environment_name}", 0, 25)}-${substr(random_id.instance.hex, 0, 4)}" # Name cannot have more than 30 characters
}

# Create a project in the GCP organization if the environment is a preview environment
resource "google_project" "instance" {
  project_id      = local.project_id
  name            = local.project_id
  org_id          = var.gcp_organization_id
  billing_account = var.gcp_billing_account_id

  # Remove project from billing account after it is destroyed
  provisioner "local-exec" {
    when    = destroy
    command = "gcloud auth activate-service-account --key-file=credentials.json && gcloud beta billing projects unlink ${self.project_id}"
  }
}

output "project_id" {
  value = google_project.instance.project_id
}

# Enable APIs
module "gcp_apis" {
  source         = "../gcp-apis"    # Path to the module
  gcp_project_id = local.project_id # The ID of the project to enable APIs
  apis           = var.apis         # The list of APIs to enable
  depends_on     = [google_project.instance]
}

module "project_owner" {
  source              = "../gcp-account-permissions"
  count               = var.is_production_environment ? 1 : 1
  account_member_type = "user"
  gcp_roles           = ["roles/owner"]
  account_email       = var.owner_account_email
  gcp_project_id      = google_project.instance.project_id
  depends_on          = [google_project.instance]
}

module "project_admin" {
  source              = "../gcp-account-permissions"
  count               = var.is_production_environment ? 1 : 1
  account_member_type = "serviceAccount"
  gcp_roles = [
    "roles/serviceusage.serviceUsageAdmin",
    "roles/resourcemanager.projectIamAdmin",
    "roles/artifactregistry.admin",
    "roles/servicemanagement.admin",
    "roles/storage.admin",
    "roles/servicenetworking.networksAdmin",
    "roles/secretmanager.admin",
    "roles/iam.serviceAccountAdmin",
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
    "roles/iam.serviceAccountKeyAdmin",
    "roles/iam.securityAdmin",
    "roles/cloudsql.admin",
    "roles/compute.networkAdmin",
    "roles/vpcaccess.admin"
  ]
  account_email  = var.creator_service_account_email
  gcp_project_id = google_project.instance.project_id
}

# # Enable APIs
# module "gcp_apis" {
#   count          = var.is_production_environment ? 0 : 1
#   source         = "../gcp-apis" // path to the module
#   gcp_project_id = google_project.instance.project_id
#   apis = [
#     "compute.googleapis.com",
#     "servicenetworking.googleapis.com",
#     "sqladmin.googleapis.com",
#     "iam.googleapis.com",
#     "secretmanager.googleapis.com",
#     "vpcaccess.googleapis.com",
#     "run.googleapis.com",
#     "cloudbilling.googleapis.com"
#   ]
#   depends_on = [google_project.instance, module.project_admin]
# }
