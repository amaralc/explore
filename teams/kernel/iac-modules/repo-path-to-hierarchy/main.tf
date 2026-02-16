# Parse repository path to extract folder hierarchy
# Takes the module location and extracts folder structure that mirrors repo organization
# Example: teams/kernel/iac/production/ → folders: ["teams", "kernel", "iac"], base: "production"

locals {
  # Get the full path of this module
  module_path = path.module

  # Find the repository root by locating .git directory
  # Split path into components
  path_parts = split("/", local.module_path)

  # Find the index of "teams" directory (start of our hierarchy)
  teams_index = index(local.path_parts, "teams")

  # Validate that we found the teams directory
  is_valid = local.teams_index != null ? true : false

  # Extract the portion from "teams" onward
  # For example: if path is /repo/teams/kernel/iac/production
  # We want: ["teams", "kernel", "iac"]
  remaining_parts = local.is_valid ? slice(local.path_parts, local.teams_index, length(local.path_parts)) : []

  # Remove the last element (which is the environment/purpose like "production", "bootstrap")
  folder_names = local.is_valid && length(local.remaining_parts) > 1 ? slice(local.remaining_parts, 0, length(local.remaining_parts) - 1) : []

  # Get the last element as the base name
  base_name = local.is_valid && length(local.remaining_parts) > 0 ? local.remaining_parts[length(local.remaining_parts) - 1] : ""
}

# Output the parsed hierarchy
output "folder_names" {
  description = "List of folder names representing the hierarchy (e.g., ['teams', 'kernel', 'iac'])"
  value       = local.folder_names
}

output "base_name" {
  description = "Base name of the environment (e.g., 'production', 'bootstrap')"
  value       = local.base_name
}

output "folder_path" {
  description = "Full folder path as string (e.g., 'teams/kernel/iac')"
  value       = local.is_valid ? join("/", local.folder_names) : ""
}

output "is_valid" {
  description = "Whether the module path contains expected 'teams' directory"
  value       = local.is_valid
}
