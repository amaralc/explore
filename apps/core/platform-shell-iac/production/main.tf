data "local_file" "credentials" {
  filename = "${path.module}/credentials.json"
}

locals {
  credentials           = jsondecode(data.local_file.credentials.content)
  service_account_email = local.credentials.client_email
}

module "core_platform_shell_iac_apis" {
  source         = "../../../../libs/iac-modules/gcp-apis"
  gcp_project_id = var.gcp_project_id
  apis = [
    "cloudresourcemanager.googleapis.com",
    "serviceusage.googleapis.com",
    "artifactregistry.googleapis.com",
    "compute.googleapis.com",
    "servicenetworking.googleapis.com",
    "sqladmin.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com",
    "vpcaccess.googleapis.com",
    "run.googleapis.com",
    "cloudbilling.googleapis.com",
    "firebase.googleapis.com",
    "serviceusage.googleapis.com",    # https://firebase.google.com/docs/projects/terraform/get-started
    "identitytoolkit.googleapis.com", # Enable Firebase Identity Toolkit (https://firebase.google.com/docs/projects/terraform/get-started#tf-sample-auth)
    "cloudidentity.googleapis.com",   # Enable Google Identity Platform (https://stackoverflow.com/questions/70317379/how-to-configure-google-identity-platform-with-cli-sdk)
    "iap.googleapis.com",             # Enable Google Identity Aware Proxy (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/identity_platform_oauth_idp_config)
    # "apigee.googleapis.com" # TODO: Enable this API only if we choose to use Apigee. See https://peerlab.atlassian.net/browse/PEER-549
  ]

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
  depends_on                          = [module.core_platform_shell_iac_apis]
}
