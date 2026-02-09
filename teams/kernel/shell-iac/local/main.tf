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
# Layer 3.5: Self-signed TLS for local HTTPS access
# =============================================================================

resource "tls_private_key" "logto" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_self_signed_cert" "logto" {
  private_key_pem = tls_private_key.logto.private_key_pem

  subject {
    common_name  = "logto.${var.domain_name}"
    organization = "PeerLab Local Development"
  }

  validity_period_hours = 8760 # 1 year

  dns_names = [
    "logto.${var.domain_name}",
    "logto-admin.${var.domain_name}",
  ]

  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth",
  ]
}

resource "kubernetes_secret_v1" "logto_tls" {
  metadata {
    name      = "logto-tls"
    namespace = kubernetes_namespace_v1.logto.metadata[0].name
  }

  type = "kubernetes.io/tls"

  data = {
    "tls.crt" = tls_self_signed_cert.logto.cert_pem
    "tls.key" = tls_private_key.logto.private_key_pem
  }

  depends_on = [null_resource.minikube]
}

# =============================================================================
# Layer 4: Logto Application (reusable submodule)
# =============================================================================

# Look up the nginx ingress controller ClusterIP so the Logto pod can
# route internal HTTPS requests (OIDC token validation) through the ingress.
data "kubernetes_service_v1" "ingress_nginx" {
  metadata {
    name      = "ingress-nginx-controller"
    namespace = "ingress-nginx"
  }

  depends_on = [null_resource.minikube]
}

module "logto_k8s" {
  source         = "../../security-iam-svc/iac-logto-k8s"
  domain_name    = var.domain_name
  db_secret_name = module.logto_database.db_credentials_secret_name
  logto_image    = "svhd/logto:1.28.0"
  namespace      = kubernetes_namespace_v1.logto.metadata[0].name

  enable_ingress     = true
  ingress_class_name = "nginx"
  tls_secret_name    = kubernetes_secret_v1.logto_tls.metadata[0].name
  ingress_annotations = {
    "nginx.ingress.kubernetes.io/ssl-redirect" = "true"
  }

  # Logto internally fetches https://logto-admin.localhost/oidc/... for JWT
  # validation. Inside the pod, .localhost doesn't resolve (CoreDNS ignores it),
  # so we route these requests through the nginx ingress controller.
  host_aliases = [{
    ip        = data.kubernetes_service_v1.ingress_nginx.spec[0].cluster_ip
    hostnames = ["logto.${var.domain_name}", "logto-admin.${var.domain_name}"]
  }]

  # Self-signed cert isn't in Node.js trust store; disable TLS verification
  # for internal pod-to-ingress requests (local dev only).
  extra_env = {
    NODE_TLS_REJECT_UNAUTHORIZED = "0"
  }

  depends_on = [module.logto_database]
}
