resource "google_project_iam_member" "list" {
  count   = length(var.gcp_roles)
  project = var.gcp_project_id
  role    = var.gcp_roles[count.index]
  member  = "${var.account_member_type}:${var.account_email}"
}
