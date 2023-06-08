resource "vercel_project" "core-platform-app-shell" {
  name      = "core-platform-app-shell"
  framework = "nextjs"
  git_repository = {
    type              = "github"
    repo              = "amaralc/peerlab"
    production_branch = "production"
  }

  build_command    = "npx nx build core-platform-app-shell --prod"
  output_directory = "dist/apps/core-platform-app-shell/.next"
  dev_command      = "npx nx serve core-platform-app-shell"
}

# An environment variable that will be created
# for this project for the "production" environment.
resource "vercel_project_environment_variable" "core-platform-app-shell-production-my-env-var" {
  project_id = vercel_project.core-platform-app-shell.id
  key        = "MY_ENV_VAR"
  value      = "value-production"
  target     = ["production"]
}

# An environment variable that will be created
# for this project for the "production" environment.
resource "vercel_project_environment_variable" "core-platform-app-shell-staging-my-env-var" {
  project_id = vercel_project.core-platform-app-shell.id
  key        = "MY_ENV_VAR"
  value      = "value-staging"
  target     = ["preview", "development"]
  # git_branch = "staging" # Use this if you wish to specify a preview branch
}
