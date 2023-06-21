# resource "google_project_service" "resource_manager" {
#   project            = var.gcp_project_id
#   service            = "cloudresourcemanager.googleapis.com"
#   disable_on_destroy = true
# }

resource "google_project_service" "compute_api" {
  project                    = var.gcp_project_id
  service                    = "compute.googleapis.com"
  disable_on_destroy         = true
  disable_dependent_services = true
  # depends_on = [ google_project_service.resource_manager ]
}

module "vpc" {
  source               = "../gcp-vpc"
  environment_name     = "production"
  network_name         = "shell"
  gcp_project_id       = var.gcp_project_id
  gcp_project_location = var.gcp_location
  depends_on           = [google_project_service.compute_api]
}
