# Create nested GCP folder hierarchy from a list of folder names
# Example: ["teams", "kernel", "iac"] creates:
#   Organization → teams/ → kernel/ → iac/

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0"
    }
  }
}

variable "organization_id" {
  description = "Google Cloud Organization ID"
  type        = string
}

variable "folder_names" {
  description = "List of folder names to create in hierarchy (e.g., ['teams', 'kernel', 'iac'])"
  type        = list(string)
}

# Build the hierarchy iteratively
# Level 0: Create top-level folders under organization
locals {
  # Validate input
  is_valid = length(var.folder_names) > 0

  # Level 0: Top-level folders
  level_0_folders = {
    for name in(local.is_valid ? [var.folder_names[0]] : []) :
    name => {
      display_name = name
      parent       = "organizations/${var.organization_id}"
      parent_type  = "organizations"
    }
  }

  # Level 1: Second level folders (if they exist)
  level_1_folders = {
    for name in(local.is_valid && length(var.folder_names) > 1 ? [var.folder_names[1]] : []) :
    name => {
      display_name = name
      parent_id    = try(google_folder.level_0[var.folder_names[0]].id, null)
      parent_type  = "folders"
    }
  }

  # Level 2: Third level folders (if they exist)
  level_2_folders = {
    for name in(local.is_valid && length(var.folder_names) > 2 ? [var.folder_names[2]] : []) :
    name => {
      display_name = name
      parent_id    = try(google_folder.level_1[var.folder_names[1]].id, null)
      parent_type  = "folders"
    }
  }

  # Level 3: Fourth level folders (if they exist)
  level_3_folders = {
    for name in(local.is_valid && length(var.folder_names) > 3 ? [var.folder_names[3]] : []) :
    name => {
      display_name = name
      parent_id    = try(google_folder.level_2[var.folder_names[2]].id, null)
      parent_type  = "folders"
    }
  }

  # Level 4: Fifth level folders (if they exist)
  level_4_folders = {
    for name in(local.is_valid && length(var.folder_names) > 4 ? [var.folder_names[4]] : []) :
    name => {
      display_name = name
      parent_id    = try(google_folder.level_3[var.folder_names[3]].id, null)
      parent_type  = "folders"
    }
  }
}

# Create folders at each level
resource "google_folder" "level_0" {
  for_each = local.level_0_folders

  display_name = each.value.display_name
  parent       = each.value.parent
}

resource "google_folder" "level_1" {
  for_each = local.level_1_folders

  display_name = each.value.display_name
  parent       = "folders/${each.value.parent_id}"
}

resource "google_folder" "level_2" {
  for_each = local.level_2_folders

  display_name = each.value.display_name
  parent       = "folders/${each.value.parent_id}"
}

resource "google_folder" "level_3" {
  for_each = local.level_3_folders

  display_name = each.value.display_name
  parent       = "folders/${each.value.parent_id}"
}

resource "google_folder" "level_4" {
  for_each = local.level_4_folders

  display_name = each.value.display_name
  parent       = "folders/${each.value.parent_id}"
}

# Outputs
output "folder_ids" {
  description = "Map of folder names to their IDs"
  value = merge(
    { for k, v in google_folder.level_0 : k => v.id },
    { for k, v in google_folder.level_1 : k => v.id },
    { for k, v in google_folder.level_2 : k => v.id },
    { for k, v in google_folder.level_3 : k => v.id },
    { for k, v in google_folder.level_4 : k => v.id },
  )
}

output "leaf_folder_id" {
  description = "The ID of the leaf (deepest) folder in the hierarchy"
  value = (
    length(var.folder_names) > 4 ? try(google_folder.level_4[var.folder_names[4]].id, null) :
    length(var.folder_names) > 3 ? try(google_folder.level_3[var.folder_names[3]].id, null) :
    length(var.folder_names) > 2 ? try(google_folder.level_2[var.folder_names[2]].id, null) :
    length(var.folder_names) > 1 ? try(google_folder.level_1[var.folder_names[1]].id, null) :
    length(var.folder_names) > 0 ? try(google_folder.level_0[var.folder_names[0]].id, null) :
    null
  )
}

output "folder_hierarchy_path" {
  description = "The full path of folders created (e.g., 'teams/kernel/iac')"
  value       = join("/", var.folder_names)
}
