locals {
  is_production_environment = var.neon_project_id == null
}

# PostgreSQL Database Management System
# Reference: https://registry.terraform.io/providers/kislerdm/neon/latest/docs
resource "neon_project" "instance" {
  count     = local.is_production_environment ? 1 : 0
  name      = var.environment_name
  region_id = var.neon_project_location #"aws-eu-central-1"
}

resource "neon_branch" "instance" {
  count      = local.is_production_environment ? 0 : 1
  project_id = var.neon_project_id
  name       = var.environment_name
  # parent_id  = var.parent_environment_branch_id # Decision: only allow branches from "trunk" or main environment to avoid unnecessary complexity
}

resource "neon_endpoint" "instance" {
  count      = local.is_production_environment ? 0 : 1 # We only need to create endpoint for non-default branches
  project_id = var.neon_project_id
  branch_id  = neon_branch.instance[0].id

  autoscaling_limit_min_cu = 0.25
  autoscaling_limit_max_cu = 0.25
}

output "project_id" {
  description = "The ID of the Neon project"
  value       = neon_project.instance[0].id
}

output "id" {
  description = "The ID of the environment branch in Neon PostgreSQL database management system (DBMS) instance"
  value       = local.is_production_environment ? neon_project.instance[0].default_branch_id : neon_branch.instance[0].id
}

output "host" {
  description = "The endpoint host of the Neon PostgreSQL database management system (DBMS) instance"
  value       = local.is_production_environment ? neon_project.instance[0].database_host : neon_endpoint.instance[0].host
}

output "name" {
  description = "The environment name of the Neon PostgreSQL database management system (DBMS) instance"
  value       = var.environment_name
}

output "root_username" {
  description = "The username of the Neon PostgreSQL database management system (DBMS) instance"
  value       = local.is_production_environment ? neon_project.instance[0].database_user : null
}
output "root_password" {
  description = "The username of the Neon PostgreSQL database management system (DBMS) instance"
  value       = local.is_production_environment ? neon_project.instance[0].database_password : null
}
