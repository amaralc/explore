locals {
  image_name = "researchers-peers-svc-rest-api"
}

module "production-branch-commit" {
  source                              = "../../../../../../libs/iac-modules/gcp-trigger-build-branch"
  environment_name                    = "production"
  trigger_name                        = "production-branch-commit"
  nx_affected_script_path             = "./apps/researchers/peers/svc-rest-api/nx-affected.sh"
  gcp_project_id                      = var.gcp_project_id
  gcp_location                        = var.gcp_location
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
  docker_file_path                    = var.docker_file_path
  image_name                          = local.image_name
  short_commit_sha                    = var.short_commit_sha
}
