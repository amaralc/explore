# Identity and Access Management (IAM) resources


# This block adds the Secret Manager Secret Accessor role to the service account
resource "google_project_iam_binding" "secret_accessor" {
  project = var.project_id                                                  # The ID of the project
  role    = "roles/secretmanager.secretAccessor"                            # The role to be granted. "roles/secretmanager.secretAccessor" allows read access to Secret Manager secrets
  members = [                                                               # List of members (users, groups, service accounts, etc) that will be granted the role
    "serviceAccount:${google_service_account.researchers_peers_svc.email}", # The service account to which the role will be granted
  ]
  depends_on = [google_service_account.researchers_peers_svc] # This ensures the service account is created before the role is granted
}

# This block grants the 'Service Account User' role to the service account
resource "google_project_iam_member" "service_account_user" {
  project    = var.project_id
  role       = "roles/iam.serviceAccountUser"
  member     = "serviceAccount:${google_service_account.researchers_peers_svc.email}"
  depends_on = [google_service_account.researchers_peers_svc]
}

# Assign the service account the Cloud Run Admin role
resource "google_project_iam_member" "run_admin" {
  project    = var.project_id
  role       = "roles/run.admin"
  member     = "serviceAccount:${google_service_account.researchers_peers_svc.email}"
  depends_on = [google_service_account.researchers_peers_svc]
}

# Assign the service account the Cloud Run Invoker role
resource "google_project_iam_member" "run_invoker" {
  project    = var.project_id
  role       = "roles/run.invoker"
  member     = "serviceAccount:${google_service_account.researchers_peers_svc.email}"
  depends_on = [google_service_account.researchers_peers_svc]
}
