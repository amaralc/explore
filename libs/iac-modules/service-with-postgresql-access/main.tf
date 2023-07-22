locals {
  is_production_environment = var.source_environment_branch_name == null ? true : false
}

# Create database for the service
module "database" {
  source                     = "../gcp-postgresql-dbms-database"
  gcp_sql_dbms_instance_name = var.gcp_sql_dbms_instance_name
  database_name              = substr("${var.service_name}-${var.environment_name}", 0, 60) # Since databases are duplicated from source environment, we added the environment as part of the database name
}

# Create DBMS user for the service
module "user" {
  source                     = "../gcp-postgresql-dbms-user"
  username                   = substr("${var.service_name}-${var.environment_name}", 0, 60) # Since users are duplicated from source environment, we added the environment as part of the username
  gcp_sql_dbms_instance_name = var.gcp_sql_dbms_instance_name
}

# Create local variables to simplify the creation of the database connection URL secrets
locals {
  username      = module.user.username
  password      = module.user.password
  database_name = module.database.name
  host          = var.gcp_sql_dbms_instance_host
  port          = "5432"

  # References:
  # https://stackoverflow.com/questions/68018718/terraform-google-cloud-run-add-cloud-sql-connection
  # https://github.com/hashicorp/terraform-provider-google/issues/6004#issuecomment-607282371
  database_url      = "postgres://${local.username}:${local.password}@${local.host}:${local.port}/${local.database_name}" # How to appropriately set pooler in cloud sql?
  jdbc_database_url = "jdbc:postgresql://${local.host}:${local.port}/${local.database_name}"
}

# Create database connection URL secrets
module "service_secrets" {
  source         = "../gcp-secrets"
  gcp_project_id = var.gcp_project_id
  secrets = [
    {
      name  = "database_url_${var.service_name}_${var.environment_name}"
      value = local.database_url # I'm not sure why syntax highlighting is not working here
    },
    {
      name  = "jdbc_database_url_${var.service_name}_${var.environment_name}"
      value = local.jdbc_database_url # This is useful for Keycloak only (https://www.keycloak.org/server/db)
    },
    {
      name  = "dbms_username_${var.service_name}_${var.environment_name}"
      value = local.username # This is useful for Keycloak only (https://www.keycloak.org/server/db)
    },
    {
      name  = "dbms_password_${var.service_name}_${var.environment_name}"
      value = local.password # This is useful for Keycloak only (https://www.keycloak.org/server/db)
    }
  ]
}

output "database_url_secret_id" {
  value = module.service_secrets.secret_ids[0].secret_id
}

output "database_url_secret_version" {
  value = module.service_secrets.secrets_versions[0].version_id
}

output "jdbc_database_url_secret_id" {
  value = module.service_secrets.secret_ids[1].secret_id
}

output "jdbc_database_url_secret_version" {
  value = module.service_secrets.secrets_versions[1].version_id
}

output "dbms_username_secret_id" {
  value = module.service_secrets.secret_ids[2].secret_id
}

output "dbms_username_secret_version" {
  value = module.service_secrets.secrets_versions[2].version_id
}

output "dbms_password_secret_id" {
  value = module.service_secrets.secret_ids[3].secret_id
}

output "dbms_password_secret_version" {
  value = module.service_secrets.secrets_versions[3].version_id
}

# Create service account
module "service_account" {
  source                    = "../gcp-service-account"
  gcp_project_id            = var.gcp_project_id
  service_name              = var.service_name
  environment_name          = substr(var.environment_name, 0, 60)
  short_commit_sha          = var.short_commit_sha
  is_production_environment = var.source_environment_branch_name == null ? true : false
}

output "service_account_email" {
  value = module.service_account.instance.email
}

# Add permissions to service account
module "service_account_permissions" {
  source              = "../gcp-account-permissions" // path to the module
  gcp_project_id      = var.gcp_project_id
  account_email       = module.service_account.instance.email
  account_member_type = "serviceAccount"
  gcp_roles = [
    "roles/secretmanager.secretAccessor",
    "roles/iam.serviceAccountUser",
    "roles/run.admin",
    "roles/run.invoker",
    "roles/cloudsql.client"
  ]
}

# Create IAM policy binding for each secret
resource "google_secret_manager_secret_iam_member" "secret_accessor" {
  count     = length(module.service_secrets.secret_ids)                 # Create one instance of this resource for each secret ID
  secret_id = module.service_secrets.secret_ids[count.index].secret_id  # Specify the ID of the secret for the current instance
  role      = "roles/secretmanager.secretAccessor"                      # Grant the 'Secret Manager Secret Accessor' role
  member    = "serviceAccount:${module.service_account.instance.email}" # Grant the role to the service account specified by the service account module
}
