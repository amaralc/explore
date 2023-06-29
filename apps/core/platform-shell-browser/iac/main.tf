module "vercel" {
  source                           = "../../../../libs/iac-modules/environment-vercel"
  project_name                     = "core-platform-shell-browser"
  framework                        = "nextjs"
  git_provider                     = "github"
  username_and_repository          = "amaralc/peerlab"
  branch_name                      = var.branch_name
  install_command                  = var.is_production_environment ? "yarn install" : null
  build_command                    = var.is_production_environment ? "npx nx build core-platform-shell-browser --prod" : null
  output_directory                 = var.is_production_environment ? "dist/apps/core/platform-shell-browser/.next" : null
  ignore_command                   = var.is_production_environment ? "if [ $VERCEL_ENV == 'production' ]; then exit 1; else exit 0; fi" : null
  preview_environment_variables    = var.is_production_environment ? null : null # Map of string key and values
  production_environment_variables = var.is_production_environment ? null : null # Set of objects with key, value and target (production, preview, development)
  source_environment_project_id    = var.source_environment_project_id
}

output "vercel_project_id" {
  value = module.vercel.vercel_project_id
}

