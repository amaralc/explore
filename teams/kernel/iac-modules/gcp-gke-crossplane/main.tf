# Crossplane bootstrap module
# Installs Crossplane via Helm and configures the GCP provider with Workload Identity

locals {
  crossplane_namespace = "crossplane-system"
  sa_name              = substr("crossplane-${var.environment_name}", 0, 30)
  provider_config_name = "gcp-provider-config"
}

# GCP service account for Crossplane to manage cloud resources
resource "google_service_account" "crossplane" {
  project      = var.gcp_project_id
  account_id   = local.sa_name
  display_name = "Crossplane SA for ${var.environment_name}"
}

# Grant Cloud SQL admin role to the Crossplane service account
resource "google_project_iam_member" "crossplane_sql_admin" {
  project = var.gcp_project_id
  role    = "roles/cloudsql.admin"
  member  = "serviceAccount:${google_service_account.crossplane.email}"
}

# Workload Identity binding: allow the Crossplane K8s SA to impersonate the GCP SA
resource "google_service_account_iam_member" "workload_identity" {
  service_account_id = google_service_account.crossplane.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.gcp_project_id}.svc.id.goog[${local.crossplane_namespace}/provider-gcp-sql]"
}

# Install Crossplane via Helm
resource "helm_release" "crossplane" {
  name             = "crossplane"
  repository       = "https://charts.crossplane.io/stable"
  chart            = "crossplane"
  version          = var.crossplane_version
  namespace        = local.crossplane_namespace
  create_namespace = true
  wait             = true
  timeout          = 600
}

# Install the Upbound GCP SQL provider
resource "kubernetes_manifest" "gcp_sql_provider" {
  manifest = {
    apiVersion = "pkg.crossplane.io/v1"
    kind       = "Provider"
    metadata = {
      name = "provider-gcp-sql"
    }
    spec = {
      package = "xpkg.upbound.io/upbound/provider-gcp-sql:v1.8.0"
    }
  }

  depends_on = [helm_release.crossplane]
}

# Configure the GCP provider with Workload Identity
resource "kubernetes_manifest" "gcp_provider_config" {
  manifest = {
    apiVersion = "gcp.upbound.io/v1beta1"
    kind       = "ProviderConfig"
    metadata = {
      name = local.provider_config_name
    }
    spec = {
      projectID = var.gcp_project_id
      credentials = {
        source = "InjectedIdentity"
      }
    }
  }

  depends_on = [kubernetes_manifest.gcp_sql_provider]
}
