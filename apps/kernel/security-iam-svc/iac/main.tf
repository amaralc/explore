# module "auth_provider_and_persistence" {
#   source            = "./auth"
#   application_title = var.application_title
#   gcp_project_id    = var.gcp_project_id
# }

locals {
  service_name                = "kernel-security-iam-svc"
  support_account_email       = "support@${var.domain_name}" # This group cannot be created using terraform. See project-setup.sh script for more details.
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

resource "google_firebase_project" "auth" {
  provider   = google-beta
  project    = var.gcp_project_id
  depends_on = [google_iap_brand.instance]
}

# Creates an Identity Platform config.
# Also enables Firebase Authentication with Identity Platform in the project if not already enabled
resource "google_identity_platform_config" "auth" {
  provider = google-beta
  project  = var.gcp_project_id

  # For example, you can configure to auto-delete Anonymous users.
  autodelete_anonymous_users = true # TODO: check what this means

  authorized_domains = [
    "localhost",
    "${var.gcp_project_id}.firebaseapp.com",
    "kernel-management-shell-browser.${var.domain_name}"
  ]

  depends_on = [google_firebase_project.auth]
}

# Adds more configurations, like for the email/password sign-in provider.
resource "google_identity_platform_project_default_config" "auth" {
  provider = google-beta
  project  = var.gcp_project_id
  sign_in {
    allow_duplicate_emails = false

    # anonymous {
    #   enabled = true
    # }

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
# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/iap_client
# Manually add Google Identity Aware Proxy (IAP) client after the first terraform run, from Firebase console.
# Access https://console.firebase.google.com/project/PROJECT_ID/authentication/providers and add a Google client manually
# Firebase will create the oauth iap client automatically.
# https://registry.terraform.io/providers/hashicorp/google/latest/docs/data-sources/iap_client
# resource "google_iap_client" "instance" {
#   display_name = "kernel-security-iam-svc"
#   brand        = google_iap_brand.instance.name
# }

# Origins:
# # http://localhost
# # http://localhost:5000
# # "https://${var.gcp_project_id}.firebaseapp.com"

# Redirect:
# # "https://${var.gcp_project_id}.firebaseapp.com/__/auth/handler"


# We are adding this resource manually since it results in the automatic creation of the google oauth client.
# # Reference: https://firebase.google.com/codelabs/firebase-terraform#5
# resource "google_identity_platform_default_supported_idp_config" "google_sign_in" {
#   count   = (var.gcp_google_oauth_iap_client_id != null && var.gcp_google_oauth_iap_client_secret != null) ? 1 : 0 # Id and secrets should exist prior to the usage of this resource. They are both automatically created when creating the firebase resource.
#   project = var.gcp_project_id

#   enabled       = true
#   idp_id        = "google.com"
#   client_id     = var.gcp_google_oauth_iap_client_id     # IMPORTANT: This is the client id that was created automatically during the creation of the firebase resource. You should add it manually to your terraform variables since we could not find a way to get it automatically yet.
#   client_secret = var.gcp_google_oauth_iap_client_secret # IMPORTANT: This is the client secret that was created automatically during the creation of the firebase resource. You should add it manually to your terraform variables since we could not find a way to get it automatically yet.

#   depends_on = [
#     google_firebase_project.auth,
#     google_identity_platform_project_default_config.auth
#   ]
# }

# Creates a Firebase Web App in the new project created above.
# https://firebase.google.com/docs/projects/terraform/get-started
resource "google_firebase_web_app" "kernel-management-shell-browser-vite" {
  provider     = google-beta
  project      = var.gcp_project_id
  display_name = "kernel-management-shell-browser-vite"

  # The other App types (Android and Apple) use "DELETE" by default.
  # Web apps don't use "DELETE" by default due to backward-compatibility.
  deletion_policy = "DELETE"

  # Wait for Firebase to be enabled in the Google Cloud project before creating this App.
  depends_on = [
    google_firebase_project.auth,
  ]
}

output "firebase_app_id" {
  value       = google_firebase_web_app.kernel-management-shell-browser-vite.app_id
  description = "The firebase web app id"
  sensitive   = true
}

# # # # Get web app config (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/firebase_web_app.html)
# # # data "google_firebase_web_app_config" "basic" {
# # #   provider   = google-beta
# # #   web_app_id = google_firebase_web_app.kernel-management-shell-browser.app_id
# # # }

# locals {
#   app_id         = google_firebase_web_app.kernel-management-shell-browser.app_id
#   auth_domain    = "${var.gcp_project_id}.firebaseapp.com"
#   project_id     = var.gcp_project_id
#   storage_bucket = "${var.gcp_project_id}.appspot.com"
# }

# data "google_iap_client" "kernel-security-iam-svc" {
#   provider  = google-beta
#   brand     = "projects/${var.gcp_project_id}/brands/${google_iap_brand.instance.id}"
#   client_id = var.gcp_google_oauth_iap_client_id
# }

# # # Create Browser API key
# # resource "google_apikeys_key" "primary" {
# #   name         = "kernel-management-shell-browser"
# #   display_name = "kernel-management-shell-browser"
# #   project      = var.gcp_project_id

# #   restrictions {
# #     api_targets {
# #       service = "firebase.googleapis.com"
# #     }

# #     api_targets {
# #       service = "identitytoolkit.googleapis.com"
# #     }

# #     browser_key_restrictions {
# #       allowed_referrers = ["kernel-management-shell-browser.vercel.app", "localhost:4200"]
# #     }
# #   }
# # }




# resource "google_identity_platform_default_supported_idp_config" "microsoft_sign_in" {
#   provider = google-beta
#   project  = var.gcp_project_id

#   enabled       = true
#   idp_id        = "microsoft.com"
#   client_id     = google_iap_client.instance.client_id
#   client_secret = google_iap_client.instance.secret # Reference: https://firebase.google.com/codelabs/firebase-terraform#5

#   depends_on = [
#     google_identity_platform_config.auth
#   ]
# }

# # # Add oauth idp config
# # resource "google_identity_platform_oauth_idp_config" "instance" {
# #   name          = "oidc.google.public"
# #   display_name  = google_iap_client.instance.display_name
# #   issuer        = "google"
# #   client_id     = google_iap_client.instance.client_id
# #   client_secret = google_iap_client.instance.secret
# #   enabled       = true
# #   depends_on    = [google_identity_platform_config.auth]
# # }


# # # Initialize firebase project
# # resource "google_firebase_project" "instance" {
# #   project  = var.gcp_project_id
# #   provider = google-beta
# #   depends_on = []
# # }

# resource "auth0_connection" "google_oauth2" {
#   name     = "Google-OAuth2-Connection"
#   strategy = "google-oauth2"

#   options {
#     client_id     = google_iap_client.instance.client_id
#     client_secret = google_iap_client.instance.secret
#     allowed_audiences = [
#       "localhost",
#       "kernel-management-shell-browser-vite.vercel.app"
#     ]
#     scopes                   = ["email", "profile"]
#     set_user_root_attributes = "on_each_login"
#     non_persistent_attrs     = ["ethnicity", "gender"]
#   }
# }

# resource "zitadel_org" "peerlab" {
#   name = "peerlab"
# }

# resource "zitadel_project" "kernel-security-iam-svc" {
#   name   = "kernel-security-iam-svc"
#   org_id = zitadel_org.peerlab.id
# }

# # Add Zitadel OIDC application for single page application
# # https://zitadel.com/docs/guides/integrate/login-users
# # https://zitadel.com/docs/examples/login/react#react-setup
# resource "zitadel_application_oidc" "core-management-browser-vite" {
#   project_id = zitadel_project.kernel-security-iam-svc.id
#   org_id     = zitadel_org.peerlab.id

#   name                        = "core-management-browser-vite-oidc"
#   redirect_uris               = ["http://localhost:4200/dashboard"]
#   response_types              = ["OIDC_RESPONSE_TYPE_CODE"]
#   grant_types                 = ["OIDC_GRANT_TYPE_AUTHORIZATION_CODE"]
#   post_logout_redirect_uris   = ["http://localhost:4200"]
#   app_type                    = "OIDC_APP_TYPE_USER_AGENT"
#   auth_method_type            = "OIDC_AUTH_METHOD_TYPE_NONE" # TODO - Review this setting
#   version                     = "OIDC_VERSION_1_0"
#   clock_skew                  = "0s"
#   dev_mode                    = true # TODO - Review this setting
#   access_token_type           = "OIDC_TOKEN_TYPE_BEARER"
#   access_token_role_assertion = false
#   id_token_role_assertion     = false
#   id_token_userinfo_assertion = false
#   additional_origins          = [] # TODO - Review this setting
# }


# # https://zitadel.com/docs/guides/integrate/identity-providers/google
# resource "zitadel_idp_google" "instance" {
#   name                = "Google"
#   client_id           = var.gcp_google_oauth_iap_client_id
#   client_secret       = var.gcp_google_oauth_iap_client_secret
#   scopes              = ["openid", "profile", "email"]
#   is_linking_allowed  = false
#   is_creation_allowed = true
#   is_auto_creation    = false
#   is_auto_update      = true
# }

# Get web app config (https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/firebase_web_app.html)
data "google_firebase_web_app_config" "basic" {
  provider   = google-beta
  web_app_id = google_firebase_web_app.kernel-management-shell-browser-vite.app_id
}

output "firebase_api_key" {
  value       = data.google_firebase_web_app_config.basic.api_key
  description = "The firebase api key"
  sensitive   = true
}

output "firebase_auth_domain" {
  value       = "${var.gcp_project_id}.firebaseapp.com"
  description = "The firebase auth domain"
  sensitive   = true
}

output "firebase_project_id" {
  value       = var.gcp_project_id
  description = "The firebase project id"
  sensitive   = true
}

output "firebase_storage_bucket" {
  value       = "${var.gcp_project_id}.appspot.com"
  description = "The firebase storage bucket"
  sensitive   = true
}

output "firebase_messaging_sender_id" {
  value       = data.google_firebase_web_app_config.basic.messaging_sender_id
  description = "The firebase messaging sender id"
  sensitive   = true
}
