# References
# - https://gmusumeci.medium.com/how-to-deploy-mongodb-atlas-on-gcp-using-terraform-3c88127c00d0

# Sets serverless tier
# Beware that serverless tier has some limitations (https://www.mongodb.com/docs/atlas/reference/serverless-instance-limitations/)
resource "mongodbatlas_serverless_instance" "instance" {
  count      = var.mongodb_dbms_instance_type == "SERVERLESS" ? 1 : 0
  project_id = var.mongodb_atlas_project_id
  name       = var.instance_name

  provider_settings_backing_provider_name = "GCP"
  provider_settings_provider_name         = "SERVERLESS"
  provider_settings_region_name           = "WESTERN_EUROPE" # https://www.mongodb.com/docs/atlas/reference/google-gcp/
  termination_protection_enabled          = true             # Prevents deletion by accident
}

# Sets free tier cluster (https://registry.terraform.io/providers/mongodb/mongodbatlas/latest/docs/resources/advanced_cluster)
resource "mongodbatlas_advanced_cluster" "instance" {
  count        = var.mongodb_dbms_instance_type == "CLUSTER" ? 1 : 0
  project_id   = var.mongodb_atlas_project_id
  name         = var.instance_name
  cluster_type = "REPLICASET"
  replication_specs {
    region_configs {
      electable_specs {
        instance_size = "M0"
        node_count    = 1
      }
      analytics_specs {
        instance_size = "M0"
        node_count    = 0
      }

      priority              = 1
      backing_provider_name = "GCP"

      # The region name where the cluster will be located
      # We have discovered that free TENANT, shared clusters have some limitations such as not being able to use UPDATE operations on the API
      # One example of the limitation can be seen in the following action run: https://github.com/amaralc/peerlab/actions/runs/8131138607/job/22220128074
      provider_name = "TENANT"         # See https://registry.terraform.io/providers/mongodb/mongodbatlas/latest/docs/resources/cluster
      region_name   = "WESTERN_EUROPE" # https://www.mongodb.com/docs/atlas/reference/google-gcp/
    }
  }
}

locals {
  # Example return string: standard_srv = "mongodb+srv://cluster-atlas.ygo1m.mongodb.net"
  connection_string_srv = var.mongodb_dbms_instance_type == "CLUSTER" ? mongodbatlas_advanced_cluster.instance[0].connection_strings[0].standard_srv : mongodbatlas_serverless_instance.instance[0].connection_strings_standard_srv
}

output "connection_protocol" {
  description = "The connection string protocol (Ex.: mongodb+srv)"
  value       = split("://", local.connection_string_srv)[0]
}

output "host" {
  description = "The connection string host (Ex.: cluster-atlas.ygo1m.mongodb.net)"
  sensitive   = true
  value       = split("://", local.connection_string_srv)[1]
}

output "name" {
  description = "The cluster name"
  value       = var.instance_name
}

output "type" {
  description = "The type of the MongoDB Atlas instance"
  value       = var.mongodb_dbms_instance_type
}
