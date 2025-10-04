locals {
  is_production_environment = var.source_environment_branch_name == null ? true : false
}

# Create service account
module "service_account" {
  source                    = "../gcp-service-account"
  gcp_project_id            = var.gcp_project_id
  service_name              = var.service_name
  environment_name          = substr(var.environment_name, 0, 60)
  short_commit_sha          = var.short_commit_sha
  is_production_environment = local.is_production_environment
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
    "roles/iam.serviceAccountKeyAdmin"
  ]
}

# Create DBMS user for the service
module "user" {
  source                     = "../mongodb-dbms-user"
  username                   = substr("${var.service_name}-${var.environment_name}", 0, 60) # Since users are duplicated from source environment, we added the environment as part of the username
  database_name              = var.service_name
  environment_name           = var.environment_name
  mongodb_project_id         = var.dbms_provider.mongodb_atlas.project_id
  monbodb_dbms_instance_name = var.dbms_provider.mongodb_atlas.instance_name
  mongodb_dbms_instance_type = var.dbms_provider.mongodb_atlas.instance_type
}

# Create local variables to simplify the creation of the database connection URL secrets
locals {
  database_url = var.dbms_provider.mongodb_atlas != null ? "${var.dbms_provider.mongodb_atlas.connection_string_protocol}://${module.user.username}:${module.user.password}@${var.dbms_instance_host}/?retryWrites=true&w=majority&appName=${var.database_name}" : null
}

# Create database connection URL secrets
module "service_secrets" {
  source         = "../gcp-secrets"
  gcp_project_id = var.gcp_project_id
  secrets = [
    {
      name  = "dbms_username_${var.service_name}_${var.environment_name}"
      value = module.user.username # This is useful for Keycloak only (https://www.keycloak.org/server/db)
    },
    {
      name  = "dbms_password_${var.service_name}_${var.environment_name}"
      value = module.user.password # This is useful for Keycloak only (https://www.keycloak.org/server/db)
    },
    {
      name  = "database_url_${var.service_name}_${var.environment_name}"
      value = local.database_url # I'm not sure why syntax highlighting is not working here
    }
  ]
}

output "dbms_username_secret_id" {
  value = module.service_secrets.secret_ids[0].secret_id
}

output "dbms_username_secret_version" {
  value = module.service_secrets.secrets_versions[0].version_id
}

output "dbms_password_secret_id" {
  value = module.service_secrets.secret_ids[1].secret_id
}

output "dbms_password_secret_version" {
  value = module.service_secrets.secrets_versions[1].version_id
}

output "database_url_secret_id" {
  value = module.service_secrets.secret_ids[2].secret_id
}

output "database_url_secret_version" {
  value = module.service_secrets.secrets_versions[2].version_id
}

# Create IAM policy binding for each secret
resource "google_secret_manager_secret_iam_member" "secret_accessor" {
  project   = var.gcp_project_id
  count     = length(module.service_secrets.secret_ids)                 # Create one instance of this resource for each secret ID
  secret_id = module.service_secrets.secret_ids[count.index].secret_id  # Specify the ID of the secret for the current instance
  role      = "roles/secretmanager.secretAccessor"                      # Grant the 'Secret Manager Secret Accessor' role
  member    = "serviceAccount:${module.service_account.instance.email}" # Grant the role to the service account specified by the service account module
}
