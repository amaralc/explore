output "branch_name" {
  description = "The branch name for this environment"
  value       = var.branch_name
}

output "vpc" {
  description = "The VPC module output"
  value       = module.vpc
}

output "kernel_flag_management_url" {
  description = "The url of the kernel-flag-management service"
  value       = length(module.kernel-flag-management) > 0 ? module.kernel-flag-management[0].url : ""
}

output "kernel_flag_management_admin_api_token" {
  description = "The admin api token of the kernel-flag-management service"
  value       = length(module.kernel-flag-management) > 0 ? module.kernel-flag-management[0].admin_api_token : ""
  sensitive   = true
}

output "logto_endpoint" {
  description = "The Logto application endpoint URL (cloud)"
  value       = length(module.kernel-security-iam-svc) > 0 ? module.kernel-security-iam-svc[0].logto_endpoint : ""
}

output "logto_admin_endpoint" {
  description = "The Logto admin console endpoint URL (cloud)"
  value       = length(module.kernel-security-iam-svc) > 0 ? module.kernel-security-iam-svc[0].logto_admin_endpoint : ""
}
