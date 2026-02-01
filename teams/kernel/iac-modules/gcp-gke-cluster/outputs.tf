output "cluster_name" {
  description = "The name of the GKE cluster"
  value       = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  description = "The IP address of the Kubernetes master endpoint"
  value       = google_container_cluster.primary.endpoint
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "The base64 encoded public certificate of the cluster CA"
  value       = google_container_cluster.primary.master_auth[0].cluster_ca_certificate
  sensitive   = true
}

output "cluster_location" {
  description = "The location of the GKE cluster"
  value       = google_container_cluster.primary.location
}

output "subnet_id" {
  description = "The ID of the GKE subnet"
  value       = google_compute_subnetwork.gke_subnet.id
}
