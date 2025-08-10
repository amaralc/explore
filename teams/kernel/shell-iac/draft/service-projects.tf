module "cs-svc-kernel-prod-svc-czzc" {
  source  = "terraform-google-modules/project-factory/google//modules/svpc_service_project"
  version = "~> 14.2"

  name            = "kernel-prod-service"
  project_id      = "kernel-prod-svc-czzc"
  org_id          = var.org_id
  billing_account = var.billing_account
  folder_id       = module.cs-envs["kernel"].ids["production"]

  shared_vpc = module.cs-vpc-prod-shared.project_id
  shared_vpc_subnets = [
    try(module.cs-vpc-prod-shared.subnets["europe-west1/subnet-prod-1"].self_link, ""),
  ]

  domain     = data.google_organization.org.domain
  group_name = module.cs-gg-kernel-prod-service.name
  group_role = "roles/viewer"
}

module "cs-svc-kernel-nonprod-svc-czzc" {
  source  = "terraform-google-modules/project-factory/google//modules/svpc_service_project"
  version = "~> 14.2"

  name            = "kernel-nonprod-service"
  project_id      = "kernel-nonprod-svc-czzc"
  org_id          = var.org_id
  billing_account = var.billing_account
  folder_id       = module.cs-envs["kernel"].ids["non-production"]

  shared_vpc = module.cs-vpc-nonprod-shared.project_id
  shared_vpc_subnets = [
    try(module.cs-vpc-nonprod-shared.subnets["europe-west1/subnet-non-prod-1"].self_link, ""),
  ]

  domain     = data.google_organization.org.domain
  group_name = module.cs-gg-kernel-nonprod-service.name
  group_role = "roles/viewer"
}

module "cs-svc-organizations-prod-svc-czzc" {
  source  = "terraform-google-modules/project-factory/google//modules/svpc_service_project"
  version = "~> 14.2"

  name            = "organizations-prod-service"
  project_id      = "organizations-prod-svc-czzc"
  org_id          = var.org_id
  billing_account = var.billing_account
  folder_id       = module.cs-envs["organizations"].ids["production"]

  shared_vpc = module.cs-vpc-prod-shared.project_id
  shared_vpc_subnets = [
    try(module.cs-vpc-prod-shared.subnets["us-east1/subnet-prod-2"].self_link, ""),
  ]

  domain     = data.google_organization.org.domain
  group_name = module.cs-gg-organizations-prod-service.name
  group_role = "roles/viewer"
}

module "cs-svc-organizations-nonprod-svc-czzc" {
  source  = "terraform-google-modules/project-factory/google//modules/svpc_service_project"
  version = "~> 14.2"

  name            = "organizations-nonprod-service"
  project_id      = "organizations-nonprod-svc-czzc"
  org_id          = var.org_id
  billing_account = var.billing_account
  folder_id       = module.cs-envs["organizations"].ids["non-production"]

  shared_vpc = module.cs-vpc-nonprod-shared.project_id
  shared_vpc_subnets = [
    try(module.cs-vpc-nonprod-shared.subnets["us-west1/subnet-non-prod-2"].self_link, ""),
  ]

  domain     = data.google_organization.org.domain
  group_name = module.cs-gg-organizations-nonprod-service.name
  group_role = "roles/viewer"
}
