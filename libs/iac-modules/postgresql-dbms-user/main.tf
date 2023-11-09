module "gcp_role" {
  source                     = "./gcp-postgresql-dbms-user"
  count                      = var.dbms_provider.gcp == null ? 0 : 1
  username                   = var.username
  gcp_project_id             = var.dbms_provider.gcp.project_id
  gcp_sql_dbms_instance_name = var.dbms_provider.gcp.dbms_instance_name
}

resource "neon_role" "instance" {
  count      = var.dbms_provider.neon == null ? 0 : 1
  project_id = var.dbms_provider.neon.project_id
  branch_id  = var.dbms_provider.neon.branch_id
  name       = var.username
}

output "username" {
  value     = var.dbms_provider.neon != null ? neon_role.instance[0].name : module.gcp_role[0].username
  sensitive = true
}

output "password" {
  value     = var.dbms_provider.neon != null ? neon_role.instance[0].password : module.gcp_role[0].password
  sensitive = true
}
