# Documentation with Docusaurus
module "instance" {
  source                           = "../../../../libs/iac-modules/environment-vercel"
  count                            = var.is_service_enabled ? 1 : 0 # Disable module
  project_name                     = "dx-dev-docs-browser"
  framework                        = null # https://vercel.com/docs/rest-api/endpoints#create-a-new-project
  git_provider                     = "github"
  username_and_repository          = "amaralc/peerlab"
  branch_name                      = var.branch_name
  is_production_environment        = var.is_production_environment
  install_command                  = var.is_production_environment ? "pnpm install" : null
  dev_command                      = var.is_production_environment ? "pnpm nx serve dx-dev-docs-browser" : null             # Vercel dev command
  build_command                    = var.is_production_environment ? "pnpm nx build-docs dx-dev-docs-browser --prod" : null # Use build-docs command to prevent building dependencies used for graphing purposes only
  output_directory                 = var.is_production_environment ? "dist/apps/dx/dev-docs-browser" : null                 # Attention to the output of non-nextjs projects
  ignore_command                   = var.is_production_environment ? null : null                                            # "if [ $VERCEL_ENV == 'production' ]; then exit 1; else exit 0; fi" : null
  preview_environment_variables    = var.is_production_environment ? null : null                                            # Map of string key and values
  production_environment_variables = var.is_production_environment ? null : null                                            # Set of objects with key, value and target (production, preview, development)
  source_environment_project_id    = var.source_environment_project_id
}
