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
