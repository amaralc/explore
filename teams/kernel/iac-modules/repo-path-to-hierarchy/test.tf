# Test configuration for repo-path-to-hierarchy module
# This file demonstrates how the module parses repository paths

terraform {
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = ">= 3.0"
    }
  }
}

# Test case 1: Production environment under kernel team
# Path: teams/kernel/iac/production
# Expected output: folder_names = ["teams", "kernel", "iac"], base_name = "production"
output "test_case_1_production" {
  value = {
    scenario    = "Production environment under kernel team"
    description = "teams/kernel/iac/production should parse as ['teams', 'kernel', 'iac']"
    # This would be verified by running: terraform console
    # > module.hierarchy.folder_names
  }
}

# Test case 2: Bootstrap environment under people team
# Path: teams/people/iac/bootstrap
# Expected output: folder_names = ["teams", "people", "iac"], base_name = "bootstrap"
output "test_case_2_bootstrap" {
  value = {
    scenario    = "Bootstrap environment under people team"
    description = "teams/people/iac/bootstrap should parse as ['teams', 'people', 'iac']"
  }
}

# Test case 3: Local development under things team
# Path: teams/things/iac/local
# Expected output: folder_names = ["teams", "things", "iac"], base_name = "local"
output "test_case_3_local" {
  value = {
    scenario    = "Local development under things team"
    description = "teams/things/iac/local should parse as ['teams', 'things', 'iac']"
  }
}

# Test case 4: Nested service structure
# Path: teams/people/researchers-peers-svc/iac/production
# Expected output: folder_names = ["teams", "people", "researchers-peers-svc", "iac"], base_name = "production"
output "test_case_4_service_production" {
  value = {
    scenario    = "Service-specific infrastructure under people team"
    description = "teams/people/researchers-peers-svc/iac/production should parse as ['teams', 'people', 'researchers-peers-svc', 'iac']"
  }
}
