resource "google_service_account" "service_account" {
  account_id   = var.service_account_name
  display_name = var.service_account_name
  project      = var.gcp_project_id
}

resource "google_project_iam_member" "project_iam_member" {
  count   = length(var.gcp_roles)
  project = var.gcp_project_id
  role    = var.gcp_roles[count.index]
  member  = "serviceAccount:${google_service_account.service_account.email}"
}
