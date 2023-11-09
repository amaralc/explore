# Required if using User ADCs (Application Default Credentials) for Cloud Identity API.
provider "google-beta" {
  user_project_override = true
  billing_project       = "cs-host-7429a52e63b64c79b8f51c"
}

# In order to create google groups, the calling identity should have at least the
# Group Admin role in Google Admin. More info: https://support.google.com/a/answer/2405986

module "cs-gg-kernel-prod-service" {
  source  = "terraform-google-modules/group/google"
  version = "~> 0.6"

  id           = "kernel-prod-service@hipeerlab.com"
  display_name = "kernel-prod-service"
  customer_id  = data.google_organization.org.directory_customer_id
  types = [
    "default",
    "security",
  ]
}

module "cs-gg-kernel-nonprod-service" {
  source  = "terraform-google-modules/group/google"
  version = "~> 0.6"

  id           = "kernel-nonprod-service@hipeerlab.com"
  display_name = "kernel-nonprod-service"
  customer_id  = data.google_organization.org.directory_customer_id
  types = [
    "default",
    "security",
  ]
}

module "cs-gg-organizations-prod-service" {
  source  = "terraform-google-modules/group/google"
  version = "~> 0.6"

  id           = "organizations-prod-service@hipeerlab.com"
  display_name = "organizations-prod-service"
  customer_id  = data.google_organization.org.directory_customer_id
  types = [
    "default",
    "security",
  ]
}

module "cs-gg-organizations-nonprod-service" {
  source  = "terraform-google-modules/group/google"
  version = "~> 0.6"

  id           = "organizations-nonprod-service@hipeerlab.com"
  display_name = "organizations-nonprod-service"
  customer_id  = data.google_organization.org.directory_customer_id
  types = [
    "default",
    "security",
  ]
}
