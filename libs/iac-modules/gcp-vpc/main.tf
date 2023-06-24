# https://registry.terraform.io/modules/terraform-google-modules/network/google/7.0.0
# https://github.com/GoogleCloudPlatform/solutions-terraform-cloudbuild-gitops/blob/dev/modules/vpc/main.tf

# Virtual Private Cloud (VPC) network module
resource "google_compute_network" "private_network" {
  name                    = substr("${var.gcp_project_id}-${var.environment_name}", 0, 63) # Character limit for VPC network names is 63
  project                 = var.gcp_project_id
  auto_create_subnetworks = false
}

# VPC access connector (https://registry.terraform.io/providers/hashicorp/google/latest/docs/data-sources/vpc_access_connector)
# TODO: verify if this resource has a 1:1 mapping with the VPC access connector or with the VPC network peering or with the cloud run service
resource "google_vpc_access_connector" "instance" {
  name           = "vpc-access-connection"
  ip_cidr_range  = "10.8.0.0/28" # TODO: verify if this is the correct CIDR range
  region         = var.gcp_location
  max_throughput = 300
  network        = google_compute_network.private_network.name
}

output "gcp_vpc_access_connector_name" {
  value = google_vpc_access_connector.instance.name
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
  region  = var.gcp_location
  network = google_compute_network.private_network.name
}

# NAT configuration
resource "google_compute_router_nat" "router_nat" {
  name                               = "nat"
  region                             = var.gcp_location
  router                             = google_compute_router.router.name
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
  nat_ip_allocate_option             = "AUTO_ONLY"
}
