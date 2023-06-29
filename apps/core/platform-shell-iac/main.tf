# Enable APIs
module "gcp_apis" {
  source         = "../../../libs/iac-modules/gcp-apis" // path to the module
  gcp_project_id = var.gcp_project_id
  apis = [
    "compute.googleapis.com",
    "servicenetworking.googleapis.com",
    "sqladmin.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com",
    "vpcaccess.googleapis.com",
    "run.googleapis.com"
  ]
}

# Third Approach (GCP with environment module)

# Production Environment
module "production" {
  source                              = "../../../libs/iac-modules/environment"
  branch_name                         = "production"
  environment_name                    = "production"
  short_commit_sha                    = var.short_commit_sha
  gcp_project_id                      = var.gcp_project_id
  gcp_location                        = var.gcp_location
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  depends_on                          = [module.gcp_apis]
}

# Branch Environment
module "bugfix-peer-541-prevent-preview-environment-from-being-recreated" {
  source                                                               = "../../../libs/iac-modules/environment"
  branch_name                                                          = "bugfix/PEER-541-prevent-preview-environment-from-being-recreated"
  environment_name                                                     = "bugfix-peer-541-prevent-preview-environment-from-being-recreated" # environment_name=$(echo "$branch_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g'). [hypothesis] Passing this value hardcoded here prevents the module from being destroyed and recreated unnecessarily. Take a look at the description of the environment_name variable in the environment module.
  source_environment_branch_name                                       = module.production.branch_name
  source_environment_dbms_instance_id                                  = module.production.postgresql_dbms_instance_id
  short_commit_sha                                                     = var.short_commit_sha
  gcp_project_id                                                       = var.gcp_project_id
  gcp_location                                                         = var.gcp_location
  gcp_docker_artifact_repository_name                                  = var.gcp_docker_artifact_repository_name
  production_environment_core_platform_shell_browser_vercel_project_id = module.production.core_platform_shell_browser_vercel_project_id
  depends_on                                                           = [module.gcp_apis, module.production]
}


# # Second Approach (GCP)
# # # Create production environment
# module "production" {
#   source                              = "../../../libs/iac-modules/env-production"
#   branch_name                         = "production"
#   short_commit_sha                    = var.short_commit_sha
#   gcp_project_id                      = var.gcp_project_id
#   gcp_location                        = var.gcp_location
#   gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
#   depends_on                          = [module.gcp_apis]
# }

# module "staging" {
#   source                              = "../../../libs/iac-modules/env-preview"
#   branch_name                         = "staging"
#   source_environment_branch_name      = module.production.branch_name
#   source_environment_dbms_instance_id = module.production.postgresql_dbms.google_sql_database_instance.id
#   short_commit_sha                    = var.short_commit_sha
#   gcp_project_id                      = var.gcp_project_id
#   gcp_location                        = var.gcp_location
#   gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
#   depends_on                          = [module.gcp_apis, module.production]
# }


# # # First Approach (Neon)
# module "production" {
#   environment_name                    = "production"                            # The deployment environment (branch-name, commit-hash, etc.)
#   source                              = "./production-environment"              # The path to the module
#   commit_hash                         = var.commit_hash                         # Force new cloud run revision to be created
#   vercel_api_token                    = var.vercel_api_token                    # Vercel API token
#   project_id                          = var.gcp_project_id                      # The Google Cloud project ID
#   region                              = var.gcp_project_location                # The region where resources will be created
#   gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name # The name of the Docker repository
# }

# module "staging" {
#   environment_name                    = "staging"                               # The deployment environment (branch-name, commit-hash, etc.)
#   source                              = "./preview-environment"                 # The path to the module
#   vercel_api_token                    = var.vercel_api_token                    # Vercel API token
#   neon_api_key                        = var.neon_api_key                        # Neon API key
#   neon_project_id                     = module.production.neon_project_id       # The Neon project ID
#   project_id                          = var.gcp_project_id                      # The Google Cloud project ID
#   region                              = var.gcp_project_location                # The region where resources will be created
#   commit_hash                         = var.commit_hash                         # Force new cloud run revision to be created
#   gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name # The name of the Docker repository
# }

# module "feature-PEER-550-neon-db-terraform-environment" {
#   source                              = "./preview-environment"                 # The path to the module
#   environment_name                    = "feature-PEER-550-neon-db-terraform"    # The deployment environment (branch-name, commit-hash, etc.)
#   neon_project_id                     = neon_project.peerlab-platform.id        # The Neon project ID
#   project_id                          = var.project_id                          # The Google Cloud project ID
#   region                              = var.gcp_project_location                # The region where resources will be created
#   commit_hash                         = var.commit_hash                         # Force new cloud run revision to be created
#   gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name # The name of the Docker repository
# }

