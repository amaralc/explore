# # SQL User
# resource "google_sql_user" "researchers-peers" {
#   name     = "researchers-peers"
#   instance = var.gcp_sql_database_instance_name
#   password = "researchers-peers-password"
# }

# # SQL Database
# resource "google_sql_database" "researchers-peers" {
#   name     = "researchers-peers"
#   instance = var.gcp_sql_database_instance_name
# }
