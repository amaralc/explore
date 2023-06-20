# # Service Account
# locals {
#   service_account_name = "researchers-peers-${var.environment_name}"
# }

# # This block creates a new service account
# resource "google_service_account" "researchers_peers_svc" {
#   account_id   = "researchers-peers-${var.environment_name}" # The service account's identifier within the project
#   display_name = "Researchers Peers Service Account"         # The display name for the service account (optional)
#   project      = var.project_id                              # The ID of the project that the service account will be created in
# }

# # Create the Service Account Key
# resource "google_service_account_key" "researchers_peers_svc_key" {
#   service_account_id = google_service_account.researchers_peers_svc.name
#   depends_on         = [google_service_account.researchers_peers_svc]
# }
