resource "google_project" "project" {
  project_id      = var.gcp_project_id
  billing_account = var.gcp_billing_account_id
  name            = var.gcp_project_name
  org_id          = var.gcp_organization_id
}
