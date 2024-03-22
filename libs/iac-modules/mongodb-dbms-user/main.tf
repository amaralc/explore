resource "random_password" "admin" {
  length  = 64
  special = false
}

resource "mongodbatlas_database_user" "admin" {
  username           = var.username
  password           = random_password.admin.result
  project_id         = var.mongodb_project_id
  auth_database_name = "admin"

  roles {
    role_name     = "readWrite"
    database_name = var.database_name
  }

  roles {
    role_name     = "readAnyDatabase"
    database_name = "admin"
  }

  labels {
    key   = "environment"
    value = var.environment_name
  }

  scopes {
    name = var.monbodb_dbms_instance_name
    type = "CLUSTER" # SERVERLESS is not an option. @see https://www.mongodb.com/docs/atlas/reference/api-resources-spec/v2/#tag/Database-Users/operation/createDatabaseUser
  }
}

output "username" {
  value     = var.username
  sensitive = true
}

output "password" {
  value     = random_password.admin.result
  sensitive = true
}
