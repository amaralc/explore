output "minikube_profile" {
  description = "The minikube profile name"
  value       = var.minikube_profile
}

output "kubeconfig_context" {
  description = "The kubectl context for the local cluster (same as minikube_profile)"
  value       = var.minikube_profile
}
