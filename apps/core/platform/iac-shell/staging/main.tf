# Local variables
locals {
  environment = "staging"
}

# Configure the Google Cloud Provider for Terraform
provider "google" {
  credentials = file(var.credentials_path) # The service account key
  project     = var.project_id             # Your Google Cloud project ID
  region      = var.region                 # The region where resources will be created
}

# The google-beta provider is used for features not yet available in the google provider
provider "google-beta" {
  credentials = file(var.credentials_path) # The service account key
  project     = var.project_id             # Your Google Cloud project ID
  region      = var.region                 # The region where resources will be created
}

# The Vercel provider
provider "vercel" {
  api_token = var.vercel_api_token
}

# The module name is the name of the directory containing the module


module "researchers-peers-svc-rest-api" {
  source       = "../../../../researchers/peers/svc-rest-api/iac"
  environment  = local.environment # The deployment environment (staging | production)
  project_id   = var.project_id    # The Google Cloud project ID
  region       = var.region        # The region where resources will be created
  database_url = var.database_url  # The database URL connection string
  direct_url   = var.direct_url    # The direct URL string
  commit_hash  = var.commit_hash   # The commit hash of the source code to deploy
}

resource "vercel_project" "core_platform_app_shell" {
  provider  = vercel
  name      = "core-platform-app-shell"
  framework = "nextjs"
  git_repository = {
    type              = "github"
    repo              = "amaralc/peerlab"
    production_branch = "trunk"
  }

  dev_command      = "yarn nx serve core-platform-app-shell"
  install_command  = "yarn install"
  build_command    = "yarn nx build core-platform-app-shell --prod"
  output_directory = "dist/apps/core/platform/app-shell"
}

resource "vercel_deployment" "core_platform_app_shell_production" {
  project_id = vercel_project.core_platform_app_shell.id
  ref        = "trunk" # or a git branch
  production = true
}

# resource "vercel_deployment" "core_platform_app_shell_staging" {
#   project_id = vercel_project.core_platform_app_shell.id
#   ref        = "staging" # or a git branch
#   production = false
# }
