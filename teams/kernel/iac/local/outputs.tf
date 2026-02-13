output "logto_endpoint" {
  description = "The Logto application endpoint URL"
  value       = module.environment.logto_endpoint
}

output "logto_admin_endpoint" {
  description = "The Logto admin console endpoint URL"
  value       = module.environment.logto_admin_endpoint
}

output "minikube_profile" {
  description = "The minikube profile name"
  value       = module.environment.minikube_profile
}

output "access_instructions" {
  description = "How to access the local Logto instance"
  value       = module.environment.access_instructions
}
