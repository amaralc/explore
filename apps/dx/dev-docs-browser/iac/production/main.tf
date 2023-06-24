resource "vercel_project" "instance" {
  name      = "dx-dev-docs-browser"
  framework = "docusaurus"
  git_repository = {
    type              = "github"
    repo              = "amaralc/peerlab"
    production_branch = var.environment_name
  }

  build_command    = "npx nx build dx-dev-docs-browser --prod"                          # Check the project.json file to check the name of the app
  output_directory = "dist/apps/dx/dev-docs-browser"                                    # Build locally to check the output directory (generally similar to the path to the app, but under dist/ folder)
  dev_command      = "npx nx serve dx-dev-docs-browser"                                 # Vercel dev command
  ignore_command   = "if [ $VERCEL_ENV == 'production' ]; then exit 1; else exit 0; fi" # Prevent Vercel from deploying the preview environment
}

# Add a production deployment
resource "vercel_deployment" "dx-dev-docs-browser-first-production-deployment" {
  project_id        = vercel_project.instance.id
  production        = true
  delete_on_destroy = true
  ref               = var.environment_name
}

# # An environment variable that will be created
# # for this project for the "production" environment.
# resource "vercel_project_environment_variable" "dx-dev-docs-browser-production-my-env-var" {
#   project_id = vercel_project.dx-dev-docs-browser.id
#   key        = "MY_ENV_VAR"
#   value      = "value-production"
#   target     = ["production"]
# }

# # An environment variable that will be created
# # for this project for the "production" environment.
# resource "vercel_project_environment_variable" "dx-dev-docs-browser-staging-my-env-var" {
#   project_id = vercel_project.dx-dev-docs-browser.id
#   key        = "MY_ENV_VAR"
#   value      = "value-staging"
#   target     = ["preview", "development"]
#   # git_branch = "staging" # Use this if you wish to specify a preview branch
# }


