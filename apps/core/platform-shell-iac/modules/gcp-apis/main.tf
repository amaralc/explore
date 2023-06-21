# # Enable the Resource Manager API
# resource "google_project_service" "resource_manager" {
#   project            = var.gcp_project_id
#   service            = "cloudresourcemanager.googleapis.com"
#   disable_on_destroy = true
# }

# Enable the Compute Engine API
resource "google_project_service" "compute_api" {
  project                    = var.gcp_project_id
  service                    = "compute.googleapis.com"
  disable_on_destroy         = true
  disable_dependent_services = true
}

# Enable service networking
resource "google_project_service" "service_networking" {
  project                    = var.gcp_project_id
  service                    = "servicenetworking.googleapis.com"
  disable_on_destroy         = true
  disable_dependent_services = true
}

# Enable the Cloud SQL Admin API
resource "google_project_service" "cloudsql" {
  project                    = var.gcp_project_id
  service                    = "sqladmin.googleapis.com"
  disable_on_destroy         = true
  disable_dependent_services = true
}

# Enable apis
resource "google_project_service" "project_service" {
  count                      = length(var.apis)
  project                    = var.gcp_project_id
  service                    = var.apis[count.index]
  disable_on_destroy         = true
  disable_dependent_services = true
}
