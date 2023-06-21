# Create the main Virtual Private Cloud (VPC)
module "vpc" {
  source               = "../gcp-vpc"
  environment_name     = "production"
  network_name         = "shell"
  gcp_project_id       = var.gcp_project_id
  gcp_project_location = var.gcp_location
}
