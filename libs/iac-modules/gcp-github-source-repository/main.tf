# References
# - https://cloud.google.com/build/docs/automating-builds/github/connect-repo-github#terraform_1

# Create github token secret
module "service_secrets" {
  source         = "../gcp-secrets"
  gcp_project_id = var.shell_gcp_project_id
  secrets = [
    {
      name  = "github_personal_access_token"
      value = var.github_personal_access_token # I'm not sure why syntax highlighting is not working here
    },
  ]
}

# Get project
data "google_project" "core_platform_shell_iac" {
  project_id = var.shell_gcp_project_id
}

data "google_iam_policy" "serviceagent_secretAccessor" {
  binding {
    role    = "roles/secretmanager.secretAccessor"
    members = ["serviceAccount:service-${data.google_project.core_platform_shell_iac.number}@gcp-sa-cloudbuild.iam.gserviceaccount.com"]
  }
}

resource "google_secret_manager_secret_iam_policy" "policy" {
  project     = var.shell_gcp_project_id
  secret_id   = module.service_secrets.secret_ids[0].secret_id
  policy_data = data.google_iam_policy.serviceagent_secretAccessor.policy_data
}

# # Create the GitHub connection (Repository
# # # Restriction: repository connections cannot be used for Cloud Build in global region, which is the only we can use to build images for now
# # # To use regional Cloud Build, we need to request quota increases to the specified region (europe-west3) to the google sales team (Monday 9AM ET - Friday 7PM ET);
# # # There is more context in the terraform module "gcp-trigger-build-branch"
# # # See https://console.cloud.google.com/apis/api/cloudbuild.googleapis.com/quotas?project=core-platform-shell-iac&pageState=(%22allQuotasTable%22:(%22p%22:1))
# resource "google_cloudbuildv2_connection" "gcp_github_peerlab" {
#   project  = var.shell_gcp_project_id
#   location = var.gcp_location
#   name     = "gcp-github-peerlab"

#   github_config {
#     app_installation_id = var.gcp_github_installation_id
#     authorizer_credential {
#       oauth_token_secret_version = module.service_secrets.secrets_versions[0].version_id
#     }
#   }
#   depends_on = [google_secret_manager_secret_iam_policy.policy]
# }

# resource "google_cloudbuildv2_repository" "peerlab" {
#   location          = var.gcp_location
#   name              = "peerlab"
#   parent_connection = google_cloudbuildv2_connection.gcp_github_peerlab.name
#   remote_uri        = "https://github.com/amaralc/peerlab.git"
# }

# output "repository_id" {
#   value       = google_cloudbuildv2_repository.peerlab.id
#   description = "Peerlab cloudbuild v2 repository id"
# }

# # The option below creates an empty repository, instead of a repository synced with github
# resource "google_pubsub_topic" "peerlab_repository_events" {
#   name       = "peerlab-repository-events"
#   depends_on = [google_secret_manager_secret_iam_policy.policy]
# }

# resource "google_sourcerepo_repository" "peerlab" {
#   name = "peerlab"

#   pubsub_configs {
#     topic                 = google_pubsub_topic.peerlab_repository_events.id
#     message_format        = "JSON"
#     service_account_email = var.service_account_email
#   }

#   depends_on = [google_secret_manager_secret_iam_policy.policy]
# }
