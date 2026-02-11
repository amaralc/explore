# Local IAM Sub-Module
# Provisions the IAM service (Logto) on a local Kubernetes cluster.
# Expects the platform layer (minikube + Crossplane) to be provisioned first.

# =============================================================================
# Crossplane-managed PostgreSQL
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
}

module "logto_database" {
  source             = "../../../../../iac-modules/crossplane-postgresql"
  composition_name   = "postgresql-local"
  database_name      = "logto"
  namespace          = kubernetes_namespace_v1.logto.metadata[0].name
  gcp_location       = "local"
  kubeconfig_context = var.kubeconfig_context
}

# =============================================================================
# Self-signed TLS for local HTTPS access
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
}

# =============================================================================
# Logto Application (reusable submodule)
# =============================================================================

# Look up the nginx ingress controller ClusterIP so the Logto pod can
# route internal HTTPS requests (OIDC token validation) through the ingress.
data "kubernetes_service_v1" "ingress_nginx" {
  metadata {
    name      = "ingress-nginx-controller"
    namespace = "ingress-nginx"
  }
}

module "logto_k8s" {
  source         = "../../../../../security-iam-svc/iac-logto-k8s"
  domain_name    = var.domain_name
  db_secret_name = module.logto_database.db_credentials_secret_name
  logto_image    = "svhd/logto:1.36.0"
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
