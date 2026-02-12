# Local Platform Sub-Module
# Provisions the Kubernetes cluster (minikube) and Crossplane platform layer.
# Services (IAM, etc.) depend on this module and consume Crossplane via Claims.

# =============================================================================
# Layer 1: Local Kubernetes Cluster (minikube)
# =============================================================================

resource "null_resource" "minikube" {
  triggers = {
    profile = var.minikube_profile
    memory  = var.minikube_memory
    cpus    = var.minikube_cpus
  }

  provisioner "local-exec" {
    command = <<-EOT
      minikube status --profile ${var.minikube_profile} >/dev/null 2>&1 || \
        minikube start \
          --profile ${var.minikube_profile} \
          --driver=docker \
          --memory=${var.minikube_memory} \
          --cpus=${var.minikube_cpus}
      minikube addons enable ingress --profile ${var.minikube_profile}
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = "minikube delete --profile ${self.triggers.profile}"
  }
}

# =============================================================================
# Layer 2: Crossplane Bootstrap
# =============================================================================

module "crossplane" {
  source             = "../../../../../iac-modules/crossplane-local-bootstrap"
  crossplane_version = var.crossplane_version
  kubeconfig_context = var.minikube_profile

  depends_on = [null_resource.minikube]
}
