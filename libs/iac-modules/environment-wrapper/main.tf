output "branch_name" {
  value = var.branch_name
}

# Parse branch name to environment name
data "external" "bash" {
  program = ["bash", "-c", "branch_name='${var.branch_name}'; environment_name=$(echo \"$branch_name\" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g'); echo \"{\\\"environment_name\\\": \\\"$environment_name\\\"}\""]
}

locals {
  environment_name = data.external.bash.result["environment_name"]
}

module "environment" {
  source                              = "../environment"
  environment_name                    = local.environment_name
  branch_name                         = var.branch_name
  source_environment_branch_name      = var.source_environment_branch_name
  source_environment_dbms_instance_id = var.source_environment_dbms_instance_id
  short_commit_sha                    = var.short_commit_sha
  gcp_project_id                      = var.gcp_project_id
  gcp_location                        = var.gcp_location
  gcp_docker_artifact_repository_name = var.gcp_docker_artifact_repository_name
}
