# https://registry.terraform.io/modules/terraform-google-modules/network/google/7.0.0
# https://github.com/GoogleCloudPlatform/solutions-terraform-cloudbuild-gitops/blob/dev/modules/vpc/main.tf

# Virtual Private Cloud (VPC) network module
resource "google_compute_network" "private_network" {
  name                    = "${var.gcp_project_id}-${var.environment_name}"
  project                 = var.gcp_project_id
  auto_create_subnetworks = false
}

# Private IP address
resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.private_network.id
}

# Google Networking service connection
resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.private_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# Cloud Router
resource "google_compute_router" "router" {
  name    = "router"
  region  = var.gcp_project_location
  network = google_compute_network.private_network.name
}

# NAT configuration
resource "google_compute_router_nat" "router_nat" {
  name                               = "nat"
  region                             = var.gcp_project_location
  router                             = google_compute_router.router.name
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
  nat_ip_allocate_option             = "AUTO_ONLY"
}
