# Crossplane PostgreSQL module
# Deploys XRD, Composition, and a Claim for a PostgreSQL instance.
# Supports both CloudSQL (GCP) and local (minikube) compositions.

locals {
  instance_name     = "${var.database_name}-${var.environment_name}"
  connection_secret = "${var.database_name}-db-connection"
  is_local          = var.composition_name == "postgresql-local"
}

# CompositeResourceDefinition (XRD) for PostgreSQLInstance
resource "kubernetes_manifest" "postgresql_xrd" {
  manifest = {
    apiVersion = "apiextensions.crossplane.io/v1"
    kind       = "CompositeResourceDefinition"
    metadata = {
      name = "xpostgresqlinstances.database.peerlab.io"
    }
    spec = {
      group = "database.peerlab.io"
      names = {
        kind   = "XPostgreSQLInstance"
        plural = "xpostgresqlinstances"
      }
      claimNames = {
        kind   = "PostgreSQLInstance"
        plural = "postgresqlinstances"
      }
      connectionSecretKeys = ["host", "port", "username", "password"]
      versions = [{
        name          = "v1alpha1"
        served        = true
        referenceable = true
        schema = {
          openAPIV3Schema = {
            type = "object"
            properties = {
              spec = {
                type = "object"
                properties = {
                  parameters = {
                    type = "object"
                    properties = {
                      storageGB = { type = "integer" }
                      version   = { type = "string" }
                      region    = { type = "string" }
                      tier      = { type = "string" }
                    }
                    required = ["region"]
                  }
                }
              }
            }
          }
        }
      }]
    }
  }
}

# Function for Patch & Transform pipeline step
resource "kubernetes_manifest" "function_patch_and_transform" {
  manifest = {
    apiVersion = "pkg.crossplane.io/v1beta1"
    kind       = "Function"
    metadata = {
      name = "function-patch-and-transform"
    }
    spec = {
      package = "xpkg.upbound.io/crossplane-contrib/function-patch-and-transform:v0.9.0"
    }
  }
}

# =============================================================================
# Cloud Composition (GCP CloudSQL) -- only when composition_name == "postgresql-cloudsql"
# =============================================================================

resource "kubernetes_manifest" "postgresql_composition" {
  count = local.is_local ? 0 : 1

  manifest = {
    apiVersion = "apiextensions.crossplane.io/v1"
    kind       = "Composition"
    metadata = {
      name = "postgresql-cloudsql"
      labels = {
        provider = "gcp"
        database = "postgresql"
      }
    }
    spec = {
      compositeTypeRef = {
        apiVersion = "database.peerlab.io/v1alpha1"
        kind       = "XPostgreSQLInstance"
      }
      writeConnectionSecretsToNamespace = "crossplane-system"
      mode = "Pipeline"
      pipeline = [
        {
          step = "patch-and-transform"
          functionRef = {
            name = "function-patch-and-transform"
          }
          input = {
            apiVersion = "pt.fn.crossplane.io/v1beta1"
            kind       = "Resources"
            resources = [
              {
                name = "cloudsql-instance"
                base = {
                  apiVersion = "sql.gcp.upbound.io/v1beta2"
                  kind       = "DatabaseInstance"
                  spec = {
                    forProvider = {
                      databaseVersion    = "POSTGRES_17"
                      region             = "us-central1"
                      deletionProtection = false
                      settings = [{
                        tier     = "db-f1-micro"
                        diskSize = 10
                        diskType = "PD_SSD"
                        ipConfiguration = [{
                          ipv4Enabled = true
                        }]
                      }]
                    }
                    providerConfigRef = {
                      name = var.provider_config_name
                    }
                  }
                }
                patches = [
                  {
                    type          = "FromCompositeFieldPath"
                    fromFieldPath = "spec.parameters.version"
                    toFieldPath   = "spec.forProvider.databaseVersion"
                  },
                  {
                    type          = "FromCompositeFieldPath"
                    fromFieldPath = "spec.parameters.region"
                    toFieldPath   = "spec.forProvider.region"
                  },
                  {
                    type          = "FromCompositeFieldPath"
                    fromFieldPath = "spec.parameters.tier"
                    toFieldPath   = "spec.forProvider.settings[0].tier"
                  },
                  {
                    type          = "FromCompositeFieldPath"
                    fromFieldPath = "spec.parameters.storageGB"
                    toFieldPath   = "spec.forProvider.settings[0].diskSize"
                  },
                ]
                connectionDetails = [
                  {
                    name          = "host"
                    fromFieldPath = "status.atProvider.publicIpAddress"
                    type          = "FromFieldPath"
                  },
                  {
                    name  = "port"
                    type  = "FromValue"
                    value = "5432"
                  },
                ]
              },
            ]
          }
        },
      ]
    }
  }

  depends_on = [
    kubernetes_manifest.postgresql_xrd,
    kubernetes_manifest.function_patch_and_transform,
  ]
}

# =============================================================================
# Local Composition (provider-kubernetes) -- only when composition_name == "postgresql-local"
# =============================================================================

resource "kubernetes_manifest" "postgresql_local_composition" {
  count = local.is_local ? 1 : 0

  manifest = yamldecode(file("${path.module}/compositions/postgresql-local.yaml"))

  depends_on = [
    kubernetes_manifest.postgresql_xrd,
    kubernetes_manifest.function_patch_and_transform,
  ]
}

# =============================================================================
# Claim -- references whichever composition is selected
# =============================================================================

# Use null_resource + kubectl to avoid plan-time CRD validation.
# The PostgreSQLInstance CRD is created dynamically by the XRD above,
# so it doesn't exist at plan time on fresh clusters.
resource "null_resource" "postgresql_claim" {
  triggers = {
    instance_name     = local.instance_name
    namespace         = var.namespace
    storage_gb        = var.storage_gb
    postgresql_version = var.postgresql_version
    gcp_location      = var.gcp_location
    tier              = var.tier
    composition_name  = var.composition_name
    connection_secret = local.connection_secret
    context_flag      = var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""
  }

  provisioner "local-exec" {
    command = <<-EOT
      kubectl apply ${var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""} -f - <<'YAML'
      apiVersion: database.peerlab.io/v1alpha1
      kind: PostgreSQLInstance
      metadata:
        name: ${local.instance_name}
        namespace: ${var.namespace}
      spec:
        parameters:
          storageGB: ${var.storage_gb}
          version: "${var.postgresql_version}"
          region: "${var.gcp_location}"
          tier: "${var.tier}"
        compositionRef:
          name: "${var.composition_name}"
        writeConnectionSecretToRef:
          name: "${local.connection_secret}"
      YAML
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = "kubectl delete postgresqlinstance ${self.triggers.instance_name} -n ${self.triggers.namespace} ${self.triggers.context_flag} --ignore-not-found || true"
  }

  depends_on = [
    kubernetes_manifest.postgresql_composition,
    kubernetes_manifest.postgresql_local_composition,
  ]
}
