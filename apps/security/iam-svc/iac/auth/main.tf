locals {
  service_name                = "security-iam-svc"
  domain                      = "amaralc.com"
  support_account_email       = "support@${local.domain}"
  service_account_credentials = jsondecode(file("credentials.json"))
  service_account_email       = local.service_account_credentials.client_email
}

# Identity Aware-Proxy brand (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/iap_brand)
# The support email has limitations as described in the documentation: "Can be either a user or group email. When a user email is specified, the caller must be the user with the associated email address. When a group email is specified, the caller can be either a user or a service account which is an owner of the specified group in Cloud Identity.
# In order to create a group programmatically you will need to use the cli (check our setup-project.sh script).
resource "google_iap_brand" "instance" {
  application_title = var.application_title
  support_email     = local.support_account_email # Group email
  project           = var.gcp_project_id
}

# Creates an Identity Platform config.
# Also enables Firebase Authentication with Identity Platform in the project if not.
resource "google_identity_platform_config" "auth" {
  provider = google-beta
  project  = var.gcp_project_id

  # For example, you can configure to auto-delete Anonymous users.
  autodelete_anonymous_users = true # TODO: check what this means

  depends_on = [google_iap_brand.instance]
}

# Adds more configurations, like for the email/password sign-in provider.
resource "google_identity_platform_project_default_config" "auth" {
  provider = google-beta
  project  = var.gcp_project_id

  sign_in {
    allow_duplicate_emails = false

    anonymous {
      enabled = true # TODO: check what this means
    }

    email {
      enabled           = true
      password_required = false
    }
  }

  # Wait for Authentication to be initialized before enabling email/password.
  depends_on = [
    google_identity_platform_config.auth
  ]
}

# Add iap client
resource "google_iap_client" "instance" {
  display_name = "security-iam-svc"
  brand        = google_iap_brand.instance.name
}

resource "google_identity_platform_default_supported_idp_config" "google_sign_in" {
  provider = google-beta
  project  = var.gcp_project_id

  enabled       = true
  idp_id        = "google.com"
  client_id     = google_iap_client.instance.client_id
  client_secret = google_iap_client.instance.secret # Reference: https://firebase.google.com/codelabs/firebase-terraform#5

  depends_on = [
    google_identity_platform_config.auth
  ]
}

resource "google_identity_platform_default_supported_idp_config" "microsoft_sign_in" {
  provider = google-beta
  project  = var.gcp_project_id

  enabled       = true
  idp_id        = "microsoft.com"
  client_id     = google_iap_client.instance.client_id
  client_secret = google_iap_client.instance.secret # Reference: https://firebase.google.com/codelabs/firebase-terraform#5

  depends_on = [
    google_identity_platform_config.auth
  ]
}

# # Add oauth idp config
# resource "google_identity_platform_oauth_idp_config" "instance" {
#   name          = "oidc.google.public"
#   display_name  = google_iap_client.instance.display_name
#   issuer        = "google"
#   client_id     = google_iap_client.instance.client_id
#   client_secret = google_iap_client.instance.secret
#   enabled       = true
#   depends_on    = [google_identity_platform_project_default_config.auth]
# }


# # Initialize firebase project
# resource "google_firebase_project" "instance" {
#   project  = var.gcp_project_id
#   provider = google-beta
#   depends_on = []
# }
