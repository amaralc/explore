resource "google_project_iam_member" "permissions" {
  count   = length(var.gcp_roles)
  project = var.gcp_project_id
  role    = var.gcp_roles[count.index]
  member  = "serviceAccount:${var.service_account_email}"
}
