# Crossplane PostgreSQL module
# Deploys XRD, Composition, and a Claim for a CloudSQL PostgreSQL instance
# Parameterized to support multiple databases (e.g., Logto PG17)

locals {
  instance_name      = "${var.database_name}-${var.environment_name}"
  connection_secret  = "${var.database_name}-db-connection"
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

# Composition mapping XRD to GCP CloudSQL resources (Pipeline mode)
resource "kubernetes_manifest" "postgresql_composition" {
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

# Claim that provisions the actual database instance
resource "kubernetes_manifest" "postgresql_claim" {
  manifest = {
    apiVersion = "database.peerlab.io/v1alpha1"
    kind       = "PostgreSQLInstance"
    metadata = {
      name      = local.instance_name
      namespace = var.namespace
    }
    spec = {
      parameters = {
        storageGB = var.storage_gb
        version   = var.postgresql_version
        region    = var.gcp_location
        tier      = var.tier
      }
      compositionRef = {
        name = "postgresql-cloudsql"
      }
      writeConnectionSecretToRef = {
        name = local.connection_secret
      }
    }
  }

  depends_on = [kubernetes_manifest.postgresql_composition]
}
