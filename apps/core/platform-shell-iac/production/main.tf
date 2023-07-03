# Production Environment
module "production" {
  source                              = "../../../../libs/iac-modules/environment"
  branch_name                         = "production"
  environment_name                    = "production"
  short_commit_sha                    = var.short_commit_sha
  gcp_project_id                      = var.gcp_project_id
  gcp_location                        = var.gcp_location
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  gcp_billing_account_id              = var.gcp_billing_account_id
  gcp_organization_id                 = var.gcp_organization_id
}

# TODO -> How to prevent one preview branch from applying changes that disrupt other preview environments?
# #       Option: create a new project for every preview branch?
# #       Actually the entire tfstate should be isolated for each preview branch

# # Branch Environment
# module "feature-peer-541-isolate-environments-and-terraform-states" {
#   source                                                               = "../../../../libs/iac-modules/environment"
#   branch_name                                                          = "feature/PEER-541-isolate-environments-and-terraform-states"
#   environment_name                                                     = "feature-peer-541-isolate-environments-and-terraform-states" # environment_name=$(echo "$branch_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g'). [hypothesis] Passing this value hardcoded here prevents the module from being destroyed and recreated unnecessarily. Take a look at the description of the environment_name variable in the environment module.
#   source_environment_branch_name                                       = module.production.branch_name
#   source_environment_dbms_instance_id                                  = module.production.postgresql_dbms_instance_id
#   short_commit_sha                                                     = var.short_commit_sha
#   gcp_project_id                                                       = var.gcp_project_id
#   gcp_location                                                         = var.gcp_location
#   gcp_docker_artifact_repository_name                                  = var.gcp_docker_artifact_repository_name
#   production_environment_core_platform_shell_browser_vercel_project_id = module.production.core_platform_shell_browser_vercel_project_id
#   production_environment_core_root_shell_graph_vercel_project_id       = module.production.core_root_shell_graph_vercel_project_id
#   production_environment_dx_dev_docs_browser_vercel_project_id         = module.production.dx_dev_docs_browser_vercel_project_id
#   depends_on                                                           = [module.gcp_apis, module.production]
# }
