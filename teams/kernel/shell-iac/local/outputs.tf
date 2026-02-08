output "logto_endpoint" {
  description = "The Logto application endpoint URL"
  value       = module.logto_k8s.logto_endpoint
}

output "logto_admin_endpoint" {
  description = "The Logto admin console endpoint URL"
  value       = module.logto_k8s.logto_admin_endpoint
}

output "minikube_profile" {
  description = "The minikube profile name"
  value       = var.minikube_profile
}

output "access_instructions" {
  description = "How to access the local Logto instance"
  value       = <<-EOT
    To open Logto:
      minikube service logto -n logto --profile ${var.minikube_profile}

    To check pod status:
      kubectl get pods -A --context=${var.minikube_profile}

    To tear down:
      terraform destroy -auto-approve
  EOT
}
