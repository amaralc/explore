# Local variables
locals {
  environment = "production"
}

resource "vercel_project" "nextjs-app" {
  name      = "nextjs-app"
  framework = "nextjs"
  git_repository = {
    type              = "github"
    repo              = "amaralc/peerlab"
    production_branch = "production"
  }


  build_command    = "npx nx build nextjs-app --prod"
  output_directory = "dist/apps/nextjs-app/.next"
  dev_command      = "npx nx serve nextjs-app"
}

# An environment variable that will be created
# for this project for the "production" environment.
resource "vercel_project_environment_variable" "my-env-var-production" {
  project_id = vercel_project.nextjs-app.id
  key        = "MY_ENV_VAR"
  value      = "value-production"
  target     = ["production"]
}

# An environment variable that will be created
# for this project for the "production" environment.
resource "vercel_project_environment_variable" "my-env-var-preview" {
  project_id = vercel_project.nextjs-app.id
  key        = "MY_ENV_VAR"
  value      = "value-preview"
  target     = ["preview", "development"]
}

resource "vercel_deployment" "nextjs-app-production" {
  project_id        = vercel_project.nextjs-app.id
  production        = true
  delete_on_destroy = true
  ref               = "main"
}


# # Application Shell
# # This module is only used the terraform production environment since
# # Vercel environments are used within the module to create deploy previews and other environments
# module "core-platform-app-shell" {
#   source           = "../../../../core/platform/app-shell/iac" # The path to the module
#   vercel_api_token = var.vercel_api_token                      # The Vercel API token
# }

# # Peers Service
# module "researchers-peers-svc-rest-api" {
#   source                              = "../../../../researchers/peers/svc-rest-api/iac" # The path to the module
#   environment                         = local.environment                                # The deployment environment (staging | production)
#   project_id                          = var.project_id                                   # The Google Cloud project ID
#   region                              = var.region                                       # The region where resources will be created
#   database_url                        = var.database_url                                 # The database URL connection string
#   direct_url                          = var.direct_url                                   # The direct URL string
#   commit_hash                         = var.commit_hash                                  # The commit hash of the source code to deploy
#   gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name          # The name of the Docker repository
# }


