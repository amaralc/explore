output "branch_host" {
  description = "Branch Host"
  value       = neon_branch.postgresql-dbms-environment.host
}

output "branch_id" {
  description = "Branch ID"
  value       = neon_branch.postgresql-dbms-environment.id
}
