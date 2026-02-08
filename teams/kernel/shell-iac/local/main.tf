# Local Environment - Terraform Root Module
# Provisions the IAM stack locally using minikube + Crossplane.
# Mirrors the layered structure of the production environment module
# but uses provider-kubernetes Composition instead of CloudSQL.
#
# Usage:
#   terraform init
#   terraform apply -auto-approve

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
  source              = "../../iac-modules/crossplane-local-bootstrap"
  crossplane_version  = var.crossplane_version
  kubeconfig_context  = var.minikube_profile

  depends_on = [null_resource.minikube]
}

# =============================================================================
# Layer 3: Crossplane-managed PostgreSQL
# =============================================================================

resource "kubernetes_namespace_v1" "logto" {
  metadata {
    name = "logto"
    labels = {
      "app.kubernetes.io/part-of"   = "security-iam-svc"
      "app.kubernetes.io/component" = "logto"
      "team"                        = "kernel"
    }
  }

  depends_on = [null_resource.minikube]
}

module "logto_database" {
  source             = "../../iac-modules/crossplane-postgresql"
  composition_name   = "postgresql-local"
  database_name      = "logto"
  namespace          = kubernetes_namespace_v1.logto.metadata[0].name
  gcp_location       = "local"
  kubeconfig_context = var.minikube_profile

  depends_on = [module.crossplane]
}

# =============================================================================
# Layer 4: Logto Application (reusable submodule)
# =============================================================================

module "logto_k8s" {
  source         = "../../security-iam-svc/iac-logto-k8s"
  domain_name    = var.domain_name
  db_secret_name = "logto-db-credentials"
  namespace      = kubernetes_namespace_v1.logto.metadata[0].name
  enable_ingress = false # Use minikube service tunneling instead of GKE ingress

  depends_on = [module.logto_database]
}
