# # PostgreSQL Database Management System
# module "postgresql-dbms" {
#   source                = "../postgresql-dbms"
#   neon_project_location = var.neon_project_location
#   project_id            = var.project_id
#   neon_api_key          = var.neon_api_key
# }

# Network
# VPC
resource "google_compute_network" "private_network" {
  name                    = "cloudrun-network"
  provider                = google-beta
  auto_create_subnetworks = false
}

# VPC access connector
resource "google_vpc_access_connector" "connector" {
  name           = "vpcconn"
  provider       = google-beta
  region         = var.region
  ip_cidr_range  = "10.8.0.0/28"
  max_throughput = 300
  network        = google_compute_network.private_network.name
  # depends_on     = [google_project_service.vpcaccess_api] # If enabled using terraform
}

resource "google_compute_global_address" "private_ip_address" {
  provider = google-beta

  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.private_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  provider = google-beta

  network                 = google_compute_network.private_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# Cloud Router
resource "google_compute_router" "router" {
  name     = "router"
  provider = google-beta
  region   = var.region
  network  = google_compute_network.private_network.name
}

# NAT configuration
resource "google_compute_router_nat" "router_nat" {
  name                               = "nat"
  provider                           = google-beta
  region                             = var.region
  router                             = google_compute_router.router.name
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
  nat_ip_allocate_option             = "AUTO_ONLY"
}

resource "random_id" "db_name_suffix" {
  byte_length = 4
}

resource "google_sql_database_instance" "postgresql-dbms" {
  name                = "${var.project_id}-${var.environment_name}-${random_id.db_name_suffix.hex}"
  database_version    = "POSTGRES_14"
  region              = var.region
  project             = var.project_id
  deletion_protection = false

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier = "db-f1-micro"

    # ip_configuration {
    #   ipv4_enabled = true
    #   # The VPC to associate the Cloud SQL instance with.
    #   # private_network = google_compute_network.vpc.self_link
    # }
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.private_network.id
      enable_private_path_for_google_cloud_services = true
    }
  }
}

# # PostgreSQL Database Branch Environment
# module "postgresql-dbms-environment" {
#   source                = "../postgresql-dbms-environment"
#   environment_name      = var.environment_name
#   neon_project_id       = module.postgresql-dbms.neon_project_id
#   neon_api_key          = var.neon_api_key
#   neon_parent_branch_id = "main"
# }
# resource "neon_branch" "postgresql-dbms-environment" {
#   project_id = neon_project.postgresql-dbms.id
#   name       = var.environment_name
# }

# Researchers Peers Service
module "researchers-peers-svc" {
  source                                    = "../../../researchers/peers/svc-iac"
  commit_hash                               = var.commit_hash
  environment_name                          = var.environment_name
  region                                    = var.region
  project_id                                = var.project_id
  credentials_path                          = var.credentials_path
  gcp_docker_artifact_repository_name       = var.gcp_docker_artifact_repository_name
  gcp_sql_database_instance_name            = google_sql_database_instance.postgresql-dbms.name
  gcp_sql_database_instance_connection_name = google_sql_database_instance.postgresql-dbms.connection_name
  gcp_sql_database_instance_host            = google_sql_database_instance.postgresql-dbms.private_ip_address
  gcp_vpc_access_connector_name             = google_vpc_access_connector.connector.name

  # neon_branch_host                    = module.postgresql-dbms-environment.branch_host
  # neon_branch_id                      = module.postgresql-dbms-environment.branch_id
  # neon_api_key                        = var.neon_api_key
}

# # Application Shell
# module "core-platform-shell-browser" {
#   source           = "../../../core/platform-shell-browser/iac/production" # The path to the module
#   environment_name = var.environment_name                                  # The deployment environment (branch-name, commit-hash, etc.)
#   vercel_api_token = var.vercel_api_token                                  # The Vercel API token
#   # depends_on       = [module.researchers-peers-svc]
# }

# # Documentation with Docusaurus
# module "dx-dev-docs-browser" {
#   source           = "../../../dx/dev-docs-browser/iac/production" # The path to the module
#   environment_name = var.environment_name                          # The deployment environment (branch-name, commit-hash, etc.)
#   vercel_api_token = var.vercel_api_token                          # The Vercel API token
#   # depends_on       = [module.researchers-peers-svc]
# }

