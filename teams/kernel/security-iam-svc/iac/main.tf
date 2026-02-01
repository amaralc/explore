# Security IAM Service - Orchestrator
# Deploys GKE cluster, Crossplane, and Logto IAM service

locals {
  logto_endpoint       = "https://logto.${var.domain_name}"
  logto_admin_endpoint = "https://logto-admin.${var.domain_name}"
}

# =============================================================================
# Layer 1: GKE Autopilot Cluster
# =============================================================================

module "gke_cluster" {
  source                     = "../../iac-modules/gcp-gke-cluster"
  environment_name           = var.environment_name
  gcp_project_id             = var.gcp_project_id
  gcp_location               = var.gcp_location
  gcp_network_id             = var.gcp_network_id
  enable_deletion_protection = false
}

# =============================================================================
# Layer 2: Crossplane Bootstrap
# =============================================================================

module "crossplane" {
  source                 = "../../iac-modules/gcp-gke-crossplane"
  gcp_project_id         = var.gcp_project_id
  gcp_location           = var.gcp_location
  environment_name       = var.environment_name
  cluster_endpoint       = module.gke_cluster.cluster_endpoint
  cluster_ca_certificate = module.gke_cluster.cluster_ca_certificate

  depends_on = [module.gke_cluster]
}

# =============================================================================
# Layer 3: Crossplane-managed PostgreSQL database
# =============================================================================

# PostgreSQL 17 for Logto
module "logto_database" {
  source               = "../../iac-modules/crossplane-postgresql"
  gcp_project_id       = var.gcp_project_id
  gcp_location         = var.gcp_location
  environment_name     = var.environment_name
  provider_config_name = module.crossplane.provider_config_name
  database_name        = "logto"
  namespace            = "logto"
  postgresql_version   = "POSTGRES_17"

  depends_on = [module.crossplane]
}

# =============================================================================
# Layer 4: Logto Kubernetes resources
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

resource "kubernetes_config_map_v1" "logto" {
  metadata {
    name      = "logto-config"
    namespace = kubernetes_namespace_v1.logto.metadata[0].name
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
    namespace = kubernetes_namespace_v1.logto.metadata[0].name
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
        init_container {
          name    = "logto-seed"
          image   = "svhd/logto:latest"
          command = ["sh", "-c", "npm run cli db seed -- --swe"]
          env_from {
            secret_ref {
              name = "logto-db-credentials"
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
          image = "svhd/logto:latest"
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
              name = "logto-db-credentials"
            }
          }
          env_from {
            config_map_ref {
              name = kubernetes_config_map_v1.logto.metadata[0].name
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

  depends_on = [module.logto_database]
}

resource "kubernetes_service_v1""logto" {
  metadata {
    name      = "logto"
    namespace = kubernetes_namespace_v1.logto.metadata[0].name
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
  metadata {
    name      = "logto"
    namespace = kubernetes_namespace_v1.logto.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.global-static-ip-name" = "logto-ip"
      "networking.gke.io/managed-certificates"       = "logto-cert"
    }
  }
  spec {
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
