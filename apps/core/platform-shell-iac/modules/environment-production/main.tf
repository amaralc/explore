module "project" {
  source                 = "../gcp-project"
  gcp_organization_id    = var.gcp_organization_id
  gcp_project_name       = var.gcp_project_name
  gcp_project_id         = var.gcp_project_id
  gcp_billing_account_id = var.gcp_billing_account_id
}

# module "vpc" {
#   source               = "../gcp-vpc"
#   environment_name     = "production"
#   network_name         = "shell"
#   gcp_project_id       = module.project.id
#   gcp_project_location = var.gcp_project_location
# }
