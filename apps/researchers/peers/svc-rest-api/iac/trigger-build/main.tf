locals {
  environment_image_url = "${var.gcp_location}-docker.pkg.dev/${var.project_id}/${var.gcp_docker_artifact_repository_name}/${var.image_name}:${var.environment_name}"
  commit_image_url      = "${var.gcp_location}-docker.pkg.dev/${var.project_id}/${var.gcp_docker_artifact_repository_name}/${var.image_name}:${var.short_image_sha}"
}

# This resource block defines a Google Cloud Build trigger that will react to pushes on the branch "staging"
resource "google_cloudbuild_trigger" "build" {
  # Name of the trigger
  name = "push-on-branch-staging"

  # Project ID where the trigger will be created
  project = var.gcp_project_id

  # Disable status of the trigger
  disabled = false

  # GitHub configuration
  github {
    # GitHub owner's username
    owner = "amaralc"

    # Name of the source repository
    name = "peerlab"

    # Configuration for triggering on a push to a specific branch
    push {
      # Regex pattern for the branch name to trigger on
      branch = "^staging$"
    }
  }

  # Included files for the trigger
  included_files = ["."]

  # Defines the build configuration
  build {

    # options {
    #   # The type of machine to be used while building the Docker image
    #   machine_type = "E2_HIGHCPU_32"
    # }

    # Each step in the build is represented as a list of commands
    step {
      # Name of the builder (the Docker image on Google Cloud) that will execute this build step
      name = "gcr.io/cloud-builders/docker"

      # Arguments to pass to the build step
      args = [
        "build",                     # Docker command to build an image from a Dockerfile
        "-t",                        # Tag the image with a name and optionally a tag in the 'name:tag' format
        local.environment_image_url, # Tag the image with the latest tag for a given environment
        "-t",                        # Tag the image with a name and optionally a tag in the 'name:tag' format
        local.commit_image_url,      # Tag the image with the commit SHA
        "-f",                        # Name of the Dockerfile (Default is 'PATH/Dockerfile')
        var.var.docker_file_path,    # Path to the Dockerfile
        ".",                         # The build context is the current directory
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
    #     "gcr.io/${var.project_id}/${local.app_name}:${local.image_tag}", # Specifies the Docker image to be deployed. This should be the image built in the previous steps.
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
}
