# Local Environment - Terraform Root Module
# Provisions the IAM stack locally using minikube + Kubernetes provider.
# Mirrors the layered structure of the production environment module
# but replaces GCP-specific resources with local equivalents.
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
# Layer 2: Local PostgreSQL (StatefulSet on minikube)
# =============================================================================

resource "random_string" "pg_username" {
  length  = 12
  special = false
  lower   = true
  upper   = false
  numeric = true
}

resource "random_password" "pg_password" {
  length  = 32
  special = false
}

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

resource "kubernetes_secret_v1" "postgresql_credentials" {
  metadata {
    name      = "postgresql-credentials"
    namespace = kubernetes_namespace_v1.logto.metadata[0].name
  }

  data = {
    POSTGRES_USER     = "pguser_${random_string.pg_username.result}"
    POSTGRES_PASSWORD = random_password.pg_password.result
  }
}

resource "kubernetes_stateful_set_v1" "postgresql" {
  metadata {
    name      = "postgresql"
    namespace = kubernetes_namespace_v1.logto.metadata[0].name
  }

  spec {
    service_name = "postgresql"
    replicas     = 1

    selector {
      match_labels = {
        app = "postgresql"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgresql"
        }
      }

      spec {
        automount_service_account_token = false

        container {
          name  = "postgresql"
          image = "postgres:17-alpine"

          port {
            container_port = 5432
          }

          env {
            name = "POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.postgresql_credentials.metadata[0].name
                key  = "POSTGRES_USER"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.postgresql_credentials.metadata[0].name
                key  = "POSTGRES_PASSWORD"
              }
            }
          }

          env {
            name  = "POSTGRES_DB"
            value = "logto"
          }

          readiness_probe {
            exec {
              command = ["sh", "-c", "pg_isready -U $POSTGRES_USER"]
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }

          resources {
            requests = {
              memory              = "128Mi"
              cpu                 = "100m"
              "ephemeral-storage" = "128Mi"
            }
            limits = {
              memory              = "256Mi"
              cpu                 = "250m"
              "ephemeral-storage" = "256Mi"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "postgresql" {
  metadata {
    name      = "postgresql"
    namespace = kubernetes_namespace_v1.logto.metadata[0].name
  }

  spec {
    selector = {
      app = "postgresql"
    }

    port {
      port        = 5432
      target_port = 5432
    }
  }
}

# =============================================================================
# Layer 3: Credentials (Logto DB connection secret)
# =============================================================================

resource "kubernetes_secret_v1" "logto_db_credentials" {
  metadata {
    name      = "logto-db-credentials"
    namespace = kubernetes_namespace_v1.logto.metadata[0].name
  }

  data = {
    DB_URL = "postgres://pguser_${random_string.pg_username.result}:${random_password.pg_password.result}@postgresql.logto.svc.cluster.local:5432/logto"
  }

  depends_on = [kubernetes_stateful_set_v1.postgresql]
}

# =============================================================================
# Layer 4: Logto Application (reusable submodule)
# =============================================================================

module "logto_k8s" {
  source         = "../../security-iam-svc/iac-logto-k8s"
  domain_name    = var.domain_name
  db_secret_name = kubernetes_secret_v1.logto_db_credentials.metadata[0].name
  namespace        = kubernetes_namespace_v1.logto.metadata[0].name
  enable_ingress   = false # Use minikube service tunneling instead of GKE ingress

  depends_on = [
    kubernetes_secret_v1.logto_db_credentials,
    kubernetes_service_v1.postgresql,
  ]
}
