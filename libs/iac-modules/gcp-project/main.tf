# Create a project in the GCP organization if the environment is a preview environment
resource "google_project" "instance" {
  provider        = google-beta
  project_id      = var.environment_name
  name            = var.environment_name
  org_id          = var.gcp_organization_id
  billing_account = var.gcp_billing_account_id

  # Required for the project to display in any list of Firebase projects (https://firebase.google.com/docs/projects/terraform/get-started)
  labels = {
    "firebase" = "enabled"
  }

  # Remove project from billing account after it is destroyed. TODO: Unlink projects manually for now
  provisioner "local-exec" {
    when    = destroy
    command = "gcloud auth activate-service-account --key-file=credentials.json && gcloud beta billing projects unlink ${self.project_id} --quiet"
  }
}

output "project_id" {
  value = google_project.instance.project_id
}

# Enable APIs
module "gcp_apis" {
  source         = "../gcp-apis"        # Path to the module
  gcp_project_id = var.environment_name # The ID of the project to enable APIs
  apis           = var.apis             # The list of APIs to enable
  depends_on     = [google_project.instance]
}

module "project_owner" {
  source              = "../gcp-account-permissions"
  count               = var.is_production_environment ? 1 : 1
  account_member_type = "user"
  gcp_roles           = ["roles/owner"]
  account_email       = var.owner_account_email
  gcp_project_id      = google_project.instance.project_id
  depends_on          = [google_project.instance, module.gcp_apis]
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
  depends_on     = [module.gcp_apis]
}

# Add permissions to service account
module "shell_project_artifact_registry_reader" {
  source              = "../gcp-account-permissions"
  account_member_type = "serviceAccount"
  gcp_project_id      = var.gcp_shell_project_id
  account_email       = "service-${google_project.instance.number}@serverless-robot-prod.iam.gserviceaccount.com" # https://cloud.google.com/iam/docs/service-agents
  gcp_roles           = ["roles/artifactregistry.reader"]
  depends_on          = [google_project.instance, module.gcp_apis]
}
