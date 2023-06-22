resource "google_service_account" "instance" {
  account_id   = var.service_account_name
  display_name = var.service_account_name
  project      = var.gcp_project_id
}

output "instance" {
  value = google_service_account.instance
}

resource "google_service_account_key" "instance" {
  service_account_id = google_service_account.instance.account_id
  depends_on         = [google_service_account.researchers_peers_svc]
}

output "instance_key" {
  value = google_service_account_key.instance
}
