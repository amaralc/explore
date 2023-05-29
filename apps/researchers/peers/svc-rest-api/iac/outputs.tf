output "researchers_peers_svc_status" {
  description = "The URL of the service"
  value       = google_cloud_run_service.apps_researchers_peers_rest_api.status
}
