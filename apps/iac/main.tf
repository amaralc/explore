# The Vercel provider
provider "vercel" {
  api_token = var.vercel_api_token
}

resource "vercel_project" "nextjs-app" {
  name      = "nextjs-app"
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = "amaralc/nx-next-terraform-vercel"
    production_branch = "production"
  }


  build_command = "npx nx build nextjs-app --prod"
  output_directory = "dist/apps/nextjs-app/.next"
  dev_command = "npx nx serve nextjs-app"
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
  project_id = vercel_project.nextjs-app.id
  production = true
  delete_on_destroy = true
  ref = "production"
}
