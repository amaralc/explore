module "cs-common" {
  source  = "terraform-google-modules/folders/google"
  version = "5.1.0"

  parent = "organizations/${var.org_id}"
  names = [
    "common",
  ]
}

module "cs-teams" {
  source  = "terraform-google-modules/folders/google"
  version = "5.1.0"

  parent = "organizations/${var.org_id}"
  names = [
    "kernel",
    "organizations",
  ]
}

module "cs-envs" {
  for_each = module.cs-teams.ids
  source   = "terraform-google-modules/folders/google"
  version  = "5.1.0"

  parent = each.value
  names = [
    "production",
    "non-production",
    "development",
  ]
}
