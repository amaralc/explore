resource "google_compute_network" "apigee_network" {
  name = "apigee-network"
}

resource "google_compute_global_address" "apigee_range" {
  name          = "apigee-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.apigee_network.id
}

resource "google_service_networking_connection" "apigee_vpc_connection" {
  network                 = google_compute_network.apigee_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.apigee_range.name]
}

resource "google_apigee_organization" "apigee_org" {
  analytics_region   = var.gcp_location
  project_id         = var.gcp_project_id
  authorized_network = google_compute_network.apigee_network.id
  depends_on         = [google_service_networking_connection.apigee_vpc_connection]
}

resource "google_apigee_instance" "apigee_instance" {
  name     = "my-instance-name"
  location = var.gcp_location
  org_id   = google_apigee_organization.apigee_org.id
}
