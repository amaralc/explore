output "namespace" {
  description = "The Kubernetes namespace where Logto is deployed"
  value       = var.namespace
}

output "logto_endpoint" {
  description = "The Logto application endpoint URL"
  value       = local.logto_endpoint
}

output "logto_admin_endpoint" {
  description = "The Logto admin console endpoint URL"
  value       = local.logto_admin_endpoint
}

output "service_name" {
  description = "The name of the Logto Kubernetes service"
  value       = kubernetes_service_v1.logto.metadata[0].name
}
