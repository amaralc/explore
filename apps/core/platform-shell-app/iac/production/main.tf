resource "vercel_project" "core-platform-shell-app" {
  name      = "core-platform-shell-app"
  framework = "nextjs"
  git_repository = {
    type              = "github"
    repo              = "amaralc/peerlab"
    production_branch = var.environment_name
  }

  build_command    = "npx nx build core-platform-shell-app --prod"      # Check the project.json file to check the name of the app
  output_directory = "dist/apps/core/platform/platform-shell-app/.next" # Build locally to check the output directory (generally similar to the path to the app, but under dist/ folder)
  dev_command      = "npx nx serve core-platform-shell-app"
  ignore_command   = "if [ $VERCEL_ENV == 'production' ]; then exit 1; else exit 0; fi"
}

# Add a production deployment
resource "vercel_deployment" "first-production-deployment" {
  project_id        = vercel_project.core-platform-shell-app.id
  ref               = var.environment_name
  production        = true
  delete_on_destroy = true
}

# # An environment variable that will be created
# # for this project for the "production" environment.
# resource "vercel_project_environment_variable" "core-platform-shell-app-production-my-env-var" {
#   project_id = vercel_project.core-platform-shell-app.id
#   key        = "MY_ENV_VAR"
#   value      = "value-production"
#   target     = ["production"]
# }

# # An environment variable that will be created
# # for this project for the "production" environment.
# resource "vercel_project_environment_variable" "core-platform-shell-app-staging-my-env-var" {
#   project_id = vercel_project.core-platform-shell-app.id
#   key        = "MY_ENV_VAR"
#   value      = "value-staging"
#   target     = ["preview", "development"]
#   # git_branch = "staging" # Use this if you wish to specify a preview branch
# }


