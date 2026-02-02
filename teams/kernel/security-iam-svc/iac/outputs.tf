output "logto_endpoint" {
  description = "The Logto application endpoint URL"
  value       = local.logto_endpoint
}

output "logto_admin_endpoint" {
  description = "The Logto admin console endpoint URL"
  value       = local.logto_admin_endpoint
}

output "cluster_name" {
  description = "The GKE cluster name"
  value       = module.gke_cluster.cluster_name
}

output "cluster_endpoint" {
  description = "The GKE cluster endpoint"
  value       = module.gke_cluster.cluster_endpoint
  sensitive   = true
}
