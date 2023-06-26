resource "google_artifact_registry_repository" "instance" {
  location      = var.gcp_region
  repository_id = var.repository_id
  description   = var.repository_description
  format        = var.repository_format
}

output "name" {
  value = google_artifact_registry_repository.instance.name
}
