locals {
  service_account_name = var.is_production_environment == true ? trim(substr("${var.service_name}-${var.environment_name}", 0, 30), "-") : "${substr(var.service_name, 0, 15)}-${substr(var.environment_name, 0, 5)}-${substr(var.short_commit_sha, 0, 8)}" # Prevent service account name duplication between production and preview environments
}

resource "google_service_account" "instance" {
  account_id   = local.service_account_name
  display_name = local.service_account_name
  project      = var.gcp_project_id
}

output "instance" {
  value = google_service_account.instance
}

resource "google_service_account_key" "instance" {
  service_account_id = google_service_account.instance.account_id
  depends_on         = [google_service_account.instance]
}

output "instance_key" {
  value = google_service_account_key.instance
}
