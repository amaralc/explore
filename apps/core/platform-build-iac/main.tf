locals {
  credentials  = jsondecode(file(var.gcp_credentials_file_path)) # Decode the JSON credentials file
  client_email = local.credentials.client_email                  # Extract the client email from the credentials file
}

# Enable APIs
module "gcp_apis" {
  source         = "../../../libs/iac-modules/gcp-apis" // path to the module
  gcp_project_id = var.gcp_project_id
  apis = [
    "compute.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com"
  ]
}

module "docker_images_repository" {
  source                 = "../../../libs/iac-modules/gcp-artifact-registry" // path to the module
  repository_format      = "DOCKER"
  repository_description = "Docker Repository"
  gcp_project_id         = var.gcp_project_id
  gcp_region             = var.gcp_location
  repository_id          = "${var.gcp_project_id}-docker-repository"
  depends_on             = [module.gcp_apis]
}

# Analogy: Create all github actions for the researchers peers service
module "researchers_peers_triggers" {
  source                              = "../../researchers/peers/svc-rest-api/iac/triggers" // path to the module
  docker_file_path                    = "./apps/researchers/peers/svc-rest-api/dockerfile"
  gcp_project_id                      = var.gcp_project_id
  gcp_location                        = var.gcp_location
  gcp_docker_artifact_repository_name = module.docker_images_repository.name
  short_commit_sha                    = var.short_commit_sha
  depends_on                          = [module.gcp_apis, module.docker_images_repository]
}
