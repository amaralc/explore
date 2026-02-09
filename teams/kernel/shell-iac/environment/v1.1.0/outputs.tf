# =============================================================================
# Shared outputs -- work across all environment types
# =============================================================================

output "environment_type" {
  description = "The active environment type (local, preview, production)"
  value       = var.environment_type
}

output "branch_name" {
  description = "The branch name (null for local environments)"
  value       = var.branch_name
}

output "logto_endpoint" {
  description = "The Logto application endpoint URL"
  value       = local.is_local ? module.local_iam[0].logto_endpoint : null
}

output "logto_admin_endpoint" {
  description = "The Logto admin console endpoint URL"
  value       = local.is_local ? module.local_iam[0].logto_admin_endpoint : null
}

# =============================================================================
# Cloud-only outputs -- available when cloud root calls cloud-resources directly
# =============================================================================

output "vpc" {
  description = "The VPC module output (cloud only -- use cloud root)"
  value       = null
}

output "kernel_flag_management_url" {
  description = "The url of the kernel-flag-management service (cloud only -- use cloud root)"
  value       = ""
}

output "kernel_flag_management_admin_api_token" {
  description = "The admin api token of the kernel-flag-management service (cloud only -- use cloud root)"
  value       = ""
  sensitive   = true
}

# =============================================================================
# Local-only outputs (null when cloud)
# =============================================================================

output "minikube_profile" {
  description = "The minikube profile name (local only)"
  value       = local.is_local ? module.local_iam[0].minikube_profile : null
}

output "access_instructions" {
  description = "How to access the local environment (local only)"
  value       = local.is_local ? module.local_iam[0].access_instructions : null
}
