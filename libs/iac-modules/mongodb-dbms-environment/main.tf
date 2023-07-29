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
      provider_name = "GCP"
      priority      = 1
      region_name   = "US_EAST_1"
    }
  }
}
