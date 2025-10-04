# IMPORTANT!

# # For now, this is done in setup phase, using gcloud cli. There are known issues as registered in the docs below:
# # - https://github.com/terraform-google-modules/terraform-google-group/blob/v0.6.0/README.md
# # - https://cloud.google.com/identity/docs/how-to/setup#assigning_an_admin_role_to_the_service_account

# locals {
#   domain = "mydomain.com"
#   types  = ["default"]
#   label_keys = {
#     "default"  = "cloudidentity.googleapis.com/groups.discussion_forum"
#     "dynamic"  = "cloudidentity.googleapis.com/groups.dynamic"
#     "security" = "cloudidentity.googleapis.com/groups.security"
#     "external" = "system/groups/external"
#     # Placeholders according to https://cloud.google.com/identity/docs/groups#group_properties.
#     # Not supported by provider yet.
#     "posix" = "cloudidentity.googleapis.com/groups.posix"
#   }
# }

# data "google_organization" "org" {
#   count  = local.domain != "" ? 1 : 0
#   domain = local.domain
# }

# locals {
#   customer_id = data.google_organization.org[0].directory_customer_id
# }

# # Creates an identity group (https://github.com/terraform-google-modules/terraform-google-group/blob/v0.6.0/README.md)
# module "group" {
#   source  = "terraform-google-modules/group/google"
#   version = "~> 0.6"

#   id           = local.support_account_email
#   domain       = local.domain
#   display_name = "support-team"
#   description  = "Support team members will be contacted by end users to clarify doubts and help users get the most out of the platform"
#   owners       = [var.owner_account_email]
#   managers     = [local.service_account_email]
#   members      = [var.owner_account_email, local.service_account_email]
# }

# # Creates an identity group (https://github.com/terraform-google-modules/terraform-google-group/blob/v0.6.0/main.tf)
# # Currently done in setup phase
# resource "google_cloud_identity_group" "group" {
#   count                = local.domain != "" ? 1 : 0
#   provider             = google-beta
#   display_name         = "support-team"
#   description          = "support-team"
#   parent               = "customers/${local.customer_id}"
#   initial_group_config = "EMPTY"
#   group_key {
#     id = local.support_account_email
#   }

#   labels = { for t in local.types : local.label_keys[t] => "" }
# }

# # Create Group membership (currently done in setup phase)
# resource "google_cloud_identity_group_membership" "owners" {
#   for_each = toset([local.service_account_email])

#   provider = google-beta
#   group    = google_cloud_identity_group.group[0].id

#   preferred_member_key { id = each.key }

#   # MEMBER role must be specified. The order of roles should not be changed.
#   roles { name = "OWNER" }
#   roles { name = "MEMBER" }
# }
