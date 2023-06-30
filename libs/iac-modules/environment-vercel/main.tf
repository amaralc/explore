# Create a project
resource "vercel_project" "instance" {
  count     = var.is_production_environment ? 1 : 0
  name      = var.project_name
  framework = var.framework

  git_repository = {
    type              = var.git_provider
    repo              = var.username_and_repository
    production_branch = var.branch_name
  }

  environment      = var.production_environment_variables # Set of objects with key, value and target (production, preview, development)
  install_command  = var.install_command                  # "yarn install"
  dev_command      = var.dev_command                      # "npx nx serve core-platform-shell-browser"
  build_command    = var.build_command                    # "npx nx build core-platform-shell-browser --prod"                  # Check the project.json file to check the name of the app
  output_directory = var.output_directory                 # "dist/apps/core/platform-shell-browser/.next"                      # Build locally to check the output directory (generally similar to the path to the app, but under dist/ folder)
  ignore_command   = var.ignore_command                   # "if [ $VERCEL_ENV == 'production' ]; then exit 1; else exit 0; fi" # Prevent default integration from creating previews for this project. Useful to fine tool the preview generation (reference: https://neon.tech/blog/branching-with-preview-environments)
}

output "vercel_project_id" {
  value = var.is_production_environment ? vercel_project.instance[0].id : "non-existing-project-id"
}

# Add a production deployment
resource "vercel_deployment" "production_deployment" {
  count             = var.is_production_environment ? 1 : 0
  project_id        = vercel_project.instance[0].id
  ref               = var.branch_name
  production        = true
  delete_on_destroy = true # Set false if you want to keep the production deployment after destroying the infrastructure
}

# Add a preview deployment
resource "vercel_deployment" "preview_deployment" {
  count             = var.is_production_environment ? 0 : 1
  project_id        = var.is_production_environment ? "non-existing-project-id" : var.source_environment_project_id
  ref               = var.branch_name
  environment       = var.preview_environment_variables
  production        = false
  delete_on_destroy = true # Set false if you want to keep the preview deployment after destroying the infrastructure
  depends_on        = [var.source_environment_project_id]
}

# # An environment variable that will be created
# # for this project for the "production" environment.
# resource "vercel_project_environment_variable" "core-platform-shell-browser-production-my-env-var" {
#   project_id = vercel_project.core-platform-shell-browser.id
#   key        = "MY_ENV_VAR"
#   value      = "value-production"
#   target     = ["production"]
# }

# # An environment variable that will be created
# # for this project for the "production" environment.
# resource "vercel_project_environment_variable" "core-platform-shell-browser-staging-my-env-var" {
#   project_id = vercel_project.core-platform-shell-browser.id
#   key        = "MY_ENV_VAR"
#   value      = "value-staging"
#   target     = ["preview", "development"]
#   # git_branch = "staging" # Use this if you wish to specify a preview branch
# }
