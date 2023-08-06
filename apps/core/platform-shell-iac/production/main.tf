data "local_file" "credentials" {
  filename = "${path.module}/credentials.json"
}

locals {
  credentials           = jsondecode(data.local_file.credentials.content)
  service_account_email = local.credentials.client_email
}

# Production Environment
module "production" {
  source                              = "../../../../libs/iac-modules/environment"
  branch_name                         = "production"
  short_commit_sha                    = var.short_commit_sha
  gcp_project_id                      = var.gcp_project_id
  gcp_location                        = var.gcp_location
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  gcp_billing_account_id              = var.gcp_billing_account_id
  gcp_organization_id                 = var.gcp_organization_id
  mongodb_atlas_org_id                = var.mongodb_atlas_org_id
  support_account_email               = var.support_account_email
  creator_service_account_email       = local.service_account_email
  owner_account_email                 = var.owner_account_email
}
