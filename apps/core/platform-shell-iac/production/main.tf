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
}
