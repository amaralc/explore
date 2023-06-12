resource "vercel_project" "dx-docs-app" {
  name      = "dx-docs-app"
  framework = "docusaurus"
  git_repository = {
    type              = "github"
    repo              = "amaralc/peerlab"
    production_branch = var.environment_name
  }

  build_command    = "npx nx build dx-docs-app --prod"                                  # Check the project.json file to check the name of the app
  output_directory = "dist/apps/dx-docs-app"                                            # Build locally to check the output directory (generally similar to the path to the app, but under dist/ folder)
  dev_command      = "npx nx serve dx-docs-app"                                         # Vercel dev command
  ignore_command   = "if [ $VERCEL_ENV == 'production' ]; then exit 1; else exit 0; fi" # Prevent Vercel from deploying the preview environment
}

# Add a production deployment
resource "vercel_deployment" "dx-docs-app-first-production-deployment" {
  project_id        = vercel_project.dx-docs-app.id
  production        = true
  delete_on_destroy = true
  ref               = var.environment_name
}

# # An environment variable that will be created
# # for this project for the "production" environment.
# resource "vercel_project_environment_variable" "dx-docs-app-production-my-env-var" {
#   project_id = vercel_project.dx-docs-app.id
#   key        = "MY_ENV_VAR"
#   value      = "value-production"
#   target     = ["production"]
# }

# # An environment variable that will be created
# # for this project for the "production" environment.
# resource "vercel_project_environment_variable" "dx-docs-app-staging-my-env-var" {
#   project_id = vercel_project.dx-docs-app.id
#   key        = "MY_ENV_VAR"
#   value      = "value-staging"
#   target     = ["preview", "development"]
#   # git_branch = "staging" # Use this if you wish to specify a preview branch
# }


