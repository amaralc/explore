# References
# - https://gmusumeci.medium.com/how-to-deploy-mongodb-atlas-on-gcp-using-terraform-3c88127c00d0

resource "mongodbatlas_project" "instance" {
  name   = var.environment_name
  org_id = var.mongodb_atlas_org_id

  is_collect_database_specifics_statistics_enabled = true
  is_data_explorer_enabled                         = true
  is_extended_storage_sizes_enabled                = true
  is_performance_advisor_enabled                   = true
  is_realtime_performance_panel_enabled            = true
  is_schema_advisor_enabled                        = true
}

# Sets free tier cluster (https://registry.terraform.io/providers/mongodb/mongodbatlas/latest/docs/resources/advanced_cluster)
resource "mongodbatlas_advanced_cluster" "instance" {
  project_id   = "PROJECT ID"
  name         = "NAME OF CLUSTER"
  cluster_type = "REPLICASET"
  replication_specs {
    region_configs {
      electable_specs {
        instance_size = "M0"
        node_count    = 3
      }
      analytics_specs {
        instance_size = "M0"
        node_count    = 1
      }

      priority              = 1
      backing_provider_name = "GCP"
      provider_name         = "TENANT" # See https://registry.terraform.io/providers/mongodb/mongodbatlas/latest/docs/resources/cluster
      region_name           = "US_EAST_1"
    }
  }
}
