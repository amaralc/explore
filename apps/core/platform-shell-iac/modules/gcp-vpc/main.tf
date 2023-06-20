# https://registry.terraform.io/modules/terraform-google-modules/network/google/7.0.0
# https://github.com/GoogleCloudPlatform/solutions-terraform-cloudbuild-gitops/blob/dev/modules/vpc/main.tf

# Virtual Private Cloud (VPC) network module
resource "google_compute_network" "private_network" {
  name                    = "${var.gcp_project_id}-${var.environment_name}-${var.network_name}"
  project                 = var.gcp_project_id
  auto_create_subnetworks = false
}
