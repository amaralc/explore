resource "vercel_project" "dx-docs-docusaurus" {
  name      = "dx-docs-docusaurus"
  framework = "docusaurus"
  git_repository = {
    type              = "github"
    repo              = "amaralc/peerlab"
    production_branch = "production"
  }

  build_command    = "npx nx build dx-docs-docusaurus --prod" # Check the project.json file to check the name of the app
  output_directory = "dist/apps/dx/docs-docusaurus"           # Build locally to check the output directory (generally similar to the path to the app, but under dist/ folder)
  dev_command      = "npx nx serve dx-docs-docusaurus"
}

# # An environment variable that will be created
# # for this project for the "production" environment.
# resource "vercel_project_environment_variable" "dx-docs-docusaurus-production-my-env-var" {
#   project_id = vercel_project.dx-docs-docusaurus.id
#   key        = "MY_ENV_VAR"
#   value      = "value-production"
#   target     = ["production"]
# }

# # An environment variable that will be created
# # for this project for the "production" environment.
# resource "vercel_project_environment_variable" "dx-docs-docusaurus-staging-my-env-var" {
#   project_id = vercel_project.dx-docs-docusaurus.id
#   key        = "MY_ENV_VAR"
#   value      = "value-staging"
#   target     = ["preview", "development"]
#   # git_branch = "staging" # Use this if you wish to specify a preview branch
# }

# Add a production deployment
resource "vercel_deployment" "dx-docs-docusaurus-first-production-deployment" {
  project_id        = vercel_project.dx-docs-docusaurus.id
  production        = true
  delete_on_destroy = true
  ref               = "production"
}
