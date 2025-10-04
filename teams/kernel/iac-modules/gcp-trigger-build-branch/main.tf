# Reference: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloudbuild_trigger
# Errors
# - Error: Error creating Trigger: googleapi: Error 400: triggers with repository resources cannot be created in the "global" region
#   - Change to use europe-west3
# - generic::failed_precondition: due to quota restrictions, cannot run builds in this region
#   - Change to use us-west1
# - Error creating Trigger: googleapi: Error 400: location of the repository: *** does not match the current region: us-west1
#   - Move back to europe-west3
#   - Try to increase quota restrictions for europe-west3 in google console
#     - Contact our Sales Team for requests above 0.


locals {
  github_owner_username  = "amaralc"
  github_repository_name = "peerlab"
  environment_image_url  = "${var.gcp_location}-docker.pkg.dev/${var.gcp_project_id}/${var.gcp_docker_artifact_repository_name}/${var.image_name}:${var.environment_name}"
  commit_image_url       = "${var.gcp_location}-docker.pkg.dev/${var.gcp_project_id}/${var.gcp_docker_artifact_repository_name}/${var.image_name}:${var.short_commit_sha}"
}

# This resource block defines a Google Cloud Build trigger that will react to pushes on a specificgcr.io/cloud-builders/yarn
resource "google_cloudbuild_trigger" "build" {
  count = 1 # Disabled

  # Name of the trigger
  name = var.trigger_name

  # Project ID where the trigger will be created
  project = var.gcp_project_id

  # Disable status of the trigger
  disabled = false

  # # The GCP location
  # location = local.gcp_build_region

  github {
    # GitHub owner's username
    owner = local.github_owner_username

    # Name of the source repository
    name = local.github_repository_name

    # Configuration for triggering on a push to a specific branch
    push {
      # Regex pattern for the branch name to trigger on
      branch = "^${var.branch_name}$"
    }
  }

  # # GitHub configuration using Cloud Build V2 repository
  # # # This approach results in errors documented in the top of this file. An increase in quota for a specific region should be requested to the google sales team before proceeding with this solution.
  # repository_event_config {
  #   # The cloudbuildv2 repository id (see https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloudbuild_trigger)
  #   repository = var.gcp_cloudbuildv2_repository_id

  #   # Configuration for triggering on a push to a specific branch
  #   push {
  #     # Regex pattern for the branch name to trigger on
  #     branch = "^${var.branch_name}$"
  #   }
  # }

  # Included files for the trigger
  included_files = ["."]

  # Defines the build configuration
  build {

    timeout = "720s"

    # options {
    #   # The type of machine to be used while building the Docker image
    #   machine_type = "E2_HIGHCPU_32"
    # }

    # TODO: verify if app was affected before building the image (https://cloud.google.com/build/docs/automating-builds/create-manage-triggers#including_the_repository_history_in_a_build)
    # step {
    #   id   = "checkout-repository"
    #   name = "gcr.io/cloud-builders/git"
    #   args = ["fetch", "--unshallow"]
    # }

    # step {
    #   id     = "verify-if-app-was-affected"
    #   name   = "gcr.io/cloud-builders/npm:node-18.12.0"
    #   script = var.nx_affected_script
    # }

    step {
      id   = "build-image"                  # Unique identifier for the build step
      name = "gcr.io/cloud-builders/docker" # Name of the builder (the Docker image on Google Cloud) that will execute this build step
      args = [                              # Arguments to pass to the build step
        "build",                            # Docker command to build an image from a Dockerfile
        "-t",                               # Tag the image with a name and optionally a tag in the 'name:tag' format
        local.environment_image_url,        # Tag the image with the latest tag for a given environment
        "-t",                               # Tag the image with a name and optionally a tag in the 'name:tag' format
        local.commit_image_url,             # Tag the image with the commit SHA
        "-f",                               # Name of the Dockerfile (Default is 'PATH/dockerfile')
        var.docker_file_path,               # Path to the Dockerfile
        ".",                                # The build context is the current directory
      ]
    }

    # # This step pushes the Docker image to GCR
    # step {
    #   id         = "push-to-gcr"
    #   name       = "gcr.io/cloud-builders/docker" # Name of the builder (the Docker image on Google Cloud) that will execute this build step
    #   entrypoint = "bash"
    #   args = [
    #     "push",
    #     local.environment_image_url, # Push the image with the latest tag
    #     local.commit_image_url       # Push the image with the commit SHA tag
    #   ]
    # }

    # # This step deploys the service to Cloud Run after the image is built
    # step {
    #   name = "gcr.io/cloud-builders/gcloud" # Specifies the Docker image that will be used to run this step.

    #   args = [
    #     "run",                                                           # Specifies that the gcloud command will interact with Cloud Run.
    #     "deploy",                                                        # Specifies that the operation to be performed is 'deploy'.
    #     local.app_name,                                                  # Passes the name of your application as the service name to be deployed.
    #     "--image",                                                       # Flag that specifies the Docker image to be deployed.
    #     "gcr.io/${var.gcp_project_id}/${local.app_name}:${local.image_tag}", # Specifies the Docker image to be deployed. This should be the image built in the previous steps.
    #     "--region",                                                      # Flag that specifies the region in which the service will be deployed.
    #     var.region,                                                      # Specifies the region to deploy the service to.
    #     "--platform",                                                    # Flag that specifies the target platform for deployment.
    #     "managed",                                                       # Specifies that the service will be deployed on the fully managed version of Cloud Run.
    #     "--allow-unauthenticated"                                        # Flag that specifies that the service can be invoked without providing credentials, meaning it's publicly accessible.
    #   ]
    # }

    # List of Docker images to be pushed to the registry upon successful completion of all build steps
    images = [
      local.environment_image_url, # Image with the latest tag for a given environment
      local.commit_image_url       # Image with the commit SHA tag
    ]
  }

  provisioner "local-exec" {
    when    = create
    command = "gcloud beta builds triggers run ${var.trigger_name} --branch=${var.branch_name}" # Force first run after creation
    # command = "gcloud beta builds triggers run ${var.trigger_name} --branch=${var.branch_name} --region=${var.gcp_location}" # Force first run after creation
  }
}
