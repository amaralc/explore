# Test configuration for gcp-folder-hierarchy module
# This file demonstrates how the module creates nested folder structures

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0"
    }
  }
}

# Test case 1: Two-level hierarchy (teams/kernel)
output "test_case_1_two_level" {
  value = {
    scenario         = "Two-level folder hierarchy"
    input            = ["teams", "kernel"]
    expected_output  = "Organization → teams/ → kernel/"
    expected_parents = {
      teams = "organizations/[org_id]"
      kernel = "folders/[teams_folder_id]"
    }
  }
}

# Test case 2: Three-level hierarchy (teams/kernel/iac)
output "test_case_2_three_level" {
  value = {
    scenario         = "Three-level folder hierarchy"
    input            = ["teams", "kernel", "iac"]
    expected_output  = "Organization → teams/ → kernel/ → iac/"
    expected_parents = {
      teams = "organizations/[org_id]"
      kernel = "folders/[teams_folder_id]"
      iac = "folders/[kernel_folder_id]"
    }
  }
}

# Test case 3: Four-level hierarchy (teams/people/researchers-svc/iac)
output "test_case_3_four_level" {
  value = {
    scenario         = "Four-level folder hierarchy for service-specific infrastructure"
    input            = ["teams", "people", "researchers-peers-svc", "iac"]
    expected_output  = "Organization → teams/ → people/ → researchers-peers-svc/ → iac/"
    expected_parents = {
      teams = "organizations/[org_id]"
      people = "folders/[teams_folder_id]"
      researchers-peers-svc = "folders/[people_folder_id]"
      iac = "folders/[researchers-peers-svc_folder_id]"
    }
  }
}

# Module usage example:
# module "hierarchy" {
#   source            = "."
#   organization_id   = "123456789"
#   folder_names      = ["teams", "kernel", "iac"]
# }
#
# output "leaf_folder_id" {
#   value = module.hierarchy.leaf_folder_id
# }
#
# This would create the folders and return the ID of the leaf folder (iac)
# which can then be used as the parent for GCP projects.
