# # PostgreSQL Database Management System
# # Reference: https://registry.terraform.io/providers/kislerdm/neon/latest/docs
# resource "neon_project" "postgresql-dbms" {
#   name                     = var.project_id            # Use the same project ID as in the Google Cloud provider
#   region_id                = var.neon_project_location #"aws-eu-central-1"
#   autoscaling_limit_max_cu = 1
# }

# # PostgreSql Database
# # Reference: https://registry.terraform.io/providers/kislerdm/neon/latest/docs
# resource "neon_project" "peerlab-platform" {
#   name                     = "peerlab-platform"        # Use the same project ID as in the Google Cloud provider
#   region_id                = var.neon_project_location #"aws-eu-central-1"
#   autoscaling_limit_max_cu = 1
# }

# resource "neon_branch" "peerlab-platform-production" {
#   project_id = neon_project.peerlab-platform.id
#   name       = var.environment
# }

# locals {
#   host_parts  = split(".", neon_branch.peerlab-platform-production.host)
#   pooler_host = join(".", [format("%s-pooler", local.host_parts[0]), join(".", slice(local.host_parts, 1, length(local.host_parts)))])
# }


