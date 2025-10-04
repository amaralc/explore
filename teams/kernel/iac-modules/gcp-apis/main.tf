# Enabled apis
resource "google_project_service" "enabled_apis" {
  count                      = length(var.apis)
  project                    = var.gcp_project_id
  service                    = var.apis[count.index]
  disable_on_destroy         = true
  disable_dependent_services = true
}
