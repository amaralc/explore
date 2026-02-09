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
    1. Start minikube tunnel (keep running in a separate terminal):
         minikube tunnel --profile ${var.minikube_profile}

    2. Access Logto (accept the self-signed certificate warning):
         Admin Console: ${module.logto_k8s.logto_admin_endpoint}
         Application:   ${module.logto_k8s.logto_endpoint}

    3. Check status:
         kubectl get ingress -n logto --context=${var.minikube_profile}
         kubectl get pods -n logto --context=${var.minikube_profile}

    4. Tear down:
         terraform destroy -auto-approve
  EOT
}
