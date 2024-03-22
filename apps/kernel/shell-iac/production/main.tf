data "local_file" "credentials" {
  filename = "${path.module}/credentials.json"
}

data "google_organization" "org" {
  organization = "organizations/${var.gcp_organization_id}"
}

locals {
  sanitized_domain_name = replace(var.domain_name, "/[^a-zA-Z0-9]/", "-")
  credentials           = jsondecode(data.local_file.credentials.content)
  service_account_email = local.credentials.client_email
}

module "common_folder" {
  source  = "terraform-google-modules/folders/google"
  version = "~> 3.2"

  parent = "organizations/${var.gcp_organization_id}"
  names = [
    "common",
  ]
}

module "teams_folders" {
  source  = "terraform-google-modules/folders/google"
  version = "~> 3.2"

  parent = "organizations/${var.gcp_organization_id}"
  names = [
    "kernel",
    "core",
  ]
}

module "environments_folders" {
  for_each = module.teams_folders.ids
  source   = "terraform-google-modules/folders/google"
  version  = "~> 3.2"

  parent = each.value
  names = [
    "production",
    "preview",
  ]
}

module "core_platform_shell_iac_apis" {
  source         = "../../../../libs/iac-modules/gcp-apis"
  gcp_project_id = var.gcp_project_id
  apis = [
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "servicenetworking.googleapis.com",
    "sqladmin.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com",
    "vpcaccess.googleapis.com",
    "run.googleapis.com",
    "firebase.googleapis.com",
    "identitytoolkit.googleapis.com", # Enable Firebase Identity Toolkit (https://firebase.google.com/docs/projects/terraform/get-started#tf-sample-auth)
    "iap.googleapis.com",             # Enable Google Identity Aware Proxy (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/identity_platform_oauth_idp_config)
    # "cloudbuild.googleapis.com",    # TODO: Enable Cloud Build only if we choose to use it.
    # "sourcerepo.googleapis.com"     # TODO: Enable Cloud Source Repositories API if we choose to use it.
    # "apigee.googleapis.com"         # TODO: Enable this API only if we choose to use Apigee. See https://peerlab.atlassian.net/browse/PEER-549
  ]
}

# DNS Zones
resource "google_dns_managed_zone" "root_domain" {
  project     = var.gcp_project_id
  name        = local.sanitized_domain_name
  dns_name    = "${var.domain_name}."
  description = "${var.domain_name} DNS zone"
}

module "production-environment-name" {
  source                  = "../../../../libs/iac-modules/environment-name"
  environment_name_prefix = "production"
}

# Production Environment
module "production" {
  source                              = "../environment"
  count                               = 1
  branch_name                         = "production"
  domain_name                         = var.domain_name
  environment_name                    = module.production-environment-name.value
  short_commit_sha                    = var.short_commit_sha
  gcp_shell_project_id                = var.gcp_project_id
  gcp_location                        = var.gcp_location
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  gcp_billing_account_id              = var.gcp_billing_account_id
  gcp_organization_id                 = var.gcp_organization_id
  gcp_dns_managed_zone_name           = google_dns_managed_zone.root_domain.name
  neon_project_location               = var.neon_project_location
  support_account_email               = var.support_account_email
  creator_service_account_email       = local.service_account_email
  owner_account_email                 = var.owner_account_email
  nx_cloud_access_token               = var.nx_cloud_access_token
  environment_path                    = var.environment_path
  mongodb_atlas_org_id                = var.mongodb_atlas_org_id
  depends_on                          = [module.core_platform_shell_iac_apis] #, google_dns_record_set.search_console_verification]
  # gcp_cloudbuildv2_repository_id    = module.github_source_repository.repository_id
}

output "flag_management_url" {
  description = "Flag Management URL"
  value       = module.production[0].kernel_flag_management_url
}

output "flag_management_admin_api_token" {
  description = "Flag Management Admin API Token"
  value       = module.production[0].kernel_flag_management_admin_api_token
  sensitive   = true
}


