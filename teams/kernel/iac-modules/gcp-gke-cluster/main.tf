# GKE Autopilot cluster module
# Provisions a managed Kubernetes cluster with a dedicated subnet

locals {
  cluster_name = "${var.environment_name}-gke"
  subnet_name  = "${var.environment_name}-gke-subnet"
}

# Dedicated subnet for GKE nodes
resource "google_compute_subnetwork" "gke_subnet" {
  project       = var.gcp_project_id
  name          = local.subnet_name
  ip_cidr_range = "10.10.0.0/20"
  region        = var.gcp_location
  network       = var.gcp_network_id

  secondary_ip_range {
    range_name    = "${local.subnet_name}-pods"
    ip_cidr_range = "10.48.0.0/14"
  }

  secondary_ip_range {
    range_name    = "${local.subnet_name}-services"
    ip_cidr_range = "10.52.0.0/20"
  }

  private_ip_google_access = true
}

# GKE Autopilot cluster
resource "google_container_cluster" "primary" {
  project  = var.gcp_project_id
  name     = local.cluster_name
  location = var.gcp_location

  enable_autopilot    = true
  deletion_protection = var.enable_deletion_protection

  network    = var.gcp_network_id
  subnetwork = google_compute_subnetwork.gke_subnet.id

  ip_allocation_policy {
    cluster_secondary_range_name  = "${local.subnet_name}-pods"
    services_secondary_range_name = "${local.subnet_name}-services"
  }

  release_channel {
    channel = "REGULAR"
  }

  dynamic "master_authorized_networks_config" {
    for_each = length(var.master_authorized_cidr_blocks) > 0 ? [1] : []
    content {
      dynamic "cidr_blocks" {
        for_each = var.master_authorized_cidr_blocks
        content {
          cidr_block   = cidr_blocks.value.cidr_block
          display_name = cidr_blocks.value.display_name
        }
      }
    }
  }
}
