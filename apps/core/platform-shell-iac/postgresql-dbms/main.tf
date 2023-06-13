# PostgreSql Database
# Reference: https://registry.terraform.io/providers/kislerdm/neon/latest/docs
resource "neon_project" "peerlab-platform" {
  region_id                = var.neon_location #"aws-eu-central-1"
  name                     = var.project_id    # Use the same project ID as in the Google Cloud provider
  autoscaling_limit_max_cu = 1
}


resource "neon_branch" "core-platform-iac-persistence" {
  project_id = neon_project.peerlab-platform.id
  name       = var.environment
}

# resource "neon_role" "core-platform-iac-persistence" {
#   project_id = neon_project.core-platform-iac-persistence.id
#   branch_id  = neon_branch.core-platform-iac-persistence.id
#   name       = "myrole"
# }

# resource "neon_database" "core-platform-iac-persistence" {
#   project_id = neon_project.core-platform-iac-persistence.id
#   branch_id  = neon_branch.core-platform-iac-persistence.id
#   name       = "mydb"
#   owner_name = neon_role.core-platform-iac-persistence.name
# }
