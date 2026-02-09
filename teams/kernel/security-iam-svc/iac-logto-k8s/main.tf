# Logto Kubernetes Resources (portable across GKE, minikube, etc.)
# Extracted from security-iam-svc/iac to enable reuse in local environments.
# The namespace must be created by the caller and passed via the namespace variable.

locals {
  logto_endpoint       = "https://logto.${var.domain_name}"
  logto_admin_endpoint = "https://logto-admin.${var.domain_name}"
}

resource "kubernetes_config_map_v1" "logto" {
  metadata {
    name      = "logto-config"
    namespace = var.namespace
  }
  data = {
    TRUST_PROXY_HEADER = "1"
    ENDPOINT           = local.logto_endpoint
    ADMIN_ENDPOINT     = local.logto_admin_endpoint
  }
}

resource "kubernetes_deployment_v1" "logto" {
  metadata {
    name      = "logto"
    namespace = var.namespace
    labels = {
      app                         = "logto"
      "app.kubernetes.io/name"    = "logto"
      "app.kubernetes.io/part-of" = "security-iam-svc"
    }
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "logto"
      }
    }
    template {
      metadata {
        labels = {
          app                      = "logto"
          "app.kubernetes.io/name" = "logto"
        }
      }
      spec {
        dynamic "host_aliases" {
          for_each = var.host_aliases
          content {
            ip        = host_aliases.value.ip
            hostnames = host_aliases.value.hostnames
          }
        }

        init_container {
          name    = "logto-seed"
          image   = var.logto_image
          command = ["sh", "-c", "npm run cli db seed -- --swe"]
          env_from {
            secret_ref {
              name = var.db_secret_name
            }
          }
          env_from {
            config_map_ref {
              name = kubernetes_config_map_v1.logto.metadata[0].name
            }
          }
          resources {
            requests = {
              memory = "256Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }
        }
        container {
          name  = "logto"
          image = var.logto_image
          port {
            name           = "app"
            container_port = 3001
            protocol       = "TCP"
          }
          port {
            name           = "admin"
            container_port = 3002
            protocol       = "TCP"
          }
          env_from {
            secret_ref {
              name = var.db_secret_name
            }
          }
          env_from {
            config_map_ref {
              name = kubernetes_config_map_v1.logto.metadata[0].name
            }
          }
          dynamic "env" {
            for_each = var.extra_env
            content {
              name  = env.key
              value = env.value
            }
          }
          liveness_probe {
            http_get {
              path = "/api/status"
              port = 3001
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }
          readiness_probe {
            http_get {
              path = "/api/status"
              port = 3001
            }
            initial_delay_seconds = 15
            period_seconds        = 5
          }
          resources {
            requests = {
              memory = "256Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "logto" {
  metadata {
    name      = "logto"
    namespace = var.namespace
  }
  spec {
    selector = {
      app = "logto"
    }
    port {
      name        = "app"
      port        = 3001
      target_port = 3001
      protocol    = "TCP"
    }
    port {
      name        = "admin"
      port        = 3002
      target_port = 3002
      protocol    = "TCP"
    }
    type = "ClusterIP"
  }
}

resource "kubernetes_ingress_v1" "logto" {
  count = var.enable_ingress ? 1 : 0

  metadata {
    name      = "logto"
    namespace = var.namespace
    annotations = var.ingress_annotations
  }
  spec {
    ingress_class_name = var.ingress_class_name

    dynamic "tls" {
      for_each = var.tls_secret_name != null ? [1] : []
      content {
        secret_name = var.tls_secret_name
        hosts = [
          "logto.${var.domain_name}",
          "logto-admin.${var.domain_name}",
        ]
      }
    }

    rule {
      host = "logto.${var.domain_name}"
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = "logto"
              port {
                number = 3001
              }
            }
          }
        }
      }
    }
    rule {
      host = "logto-admin.${var.domain_name}"
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = "logto"
              port {
                number = 3002
              }
            }
          }
        }
      }
    }
  }
}
