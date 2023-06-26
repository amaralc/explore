# resource "neon_role" "researchers-peers" {
#   name       = local.app_name
#   project_id = var.project_id
#   branch_id  = var.neon_branch_id
# }

# resource "neon_database" "researchers-peers" {
#   name       = local.app_name
#   project_id = var.project_id
#   branch_id  = var.neon_branch_id
#   owner_name = neon_role.researchers-peers.name
# }

# locals {
#   username             = neon_role.researchers-peers.name
#   password             = neon_role.researchers-peers.password
#   database_direct_host = var.neon_branch_host
#   direct_host_parts    = split(".", local.database_direct_host)
#   database_pooler_host = join(".", [format("%s-pooler", local.direct_host_parts[0]), join(".", slice(local.direct_host_parts, 1, length(local.direct_host_parts)))])
#   database_name        = neon_database.researchers-peers.name

#   database_direct_url = "postgres://${local.username}:${local.password}@${local.database_direct_host}/${local.database_name}"
#   database_pooler_url = "postgres://${local.username}:${local.password}@${local.database_pooler_host}/${local.database_name}"
# }
