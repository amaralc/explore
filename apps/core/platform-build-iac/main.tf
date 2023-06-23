# Enable APIs
module "gcp_apis" {
  source         = "../../../libs/iac-modules/gcp-apis" // path to the module
  gcp_project_id = var.gcp_project_id
  apis = [
    "compute.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com"
  ]
}

module "docker_images_repository" {
  source                 = "../../../libs/iac-modules/gcp-artifact-registry" // path to the module
  gcp_project_id         = var.gcp_project_id
  gcp_region             = var.gcp_location
  repository_id          = "${var.gcp_project_id}-docker-repository"
  repository_format      = "DOCKER"
  repository_description = "Docker repository"
  depends_on             = [module.gcp_apis]
}
