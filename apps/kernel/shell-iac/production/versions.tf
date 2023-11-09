terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      # Test version 5.0.0 after correcting https://github.com/hashicorp/terraform-provider-google/issues/16217
      # which is related to https://github.com/amaralc/peerlab/actions/runs/6497683905/job/17647315911
      version = "4.80.0"
    }

    google-beta = {
      source = "hashicorp/google-beta"
      # Test version 5.0.0 after correcting https://github.com/hashicorp/terraform-provider-google/issues/16217
      # which is related to https://github.com/amaralc/peerlab/actions/runs/6497683905/job/17647315911
      version = "4.80.0"
    }

    neon = {
      source = "kislerdm/neon"
      # Track following issue to decide weather to upgrade or not https://github.com/kislerdm/terraform-provider-neon/issues/51
      version = "0.2.3"
    }

    random = {
      source  = "hashicorp/random"
      version = "3.5.1"
    }

    # vercel = {
    #   source  = "vercel/vercel"
    #   version = "0.15.0"
    # }

    # mongodbatlas = {
    #   source  = "mongodb/mongodbatlas"
    #   version = "1.10.2"
    # }

    # auth0 = {
    #   source  = "auth0/auth0"
    #   version = "1.0.0-beta.1"
    # }

    # zitadel = {
    #   source  = "zitadel/zitadel"
    #   version = "1.0.0"
    # }

    # docker = {
    #   source  = "kreuzwerker/docker"
    #   version = "3.0.2"
    # }

    unleash = {
      source  = "philips-labs/unleash"
      version = "0.3.8"
    }
  }
}

# Configure the Google Cloud Provider for Terraform
provider "google" {
  credentials = file(var.gcp_credentials_file_path) # The service account key
  project     = var.gcp_project_id                  # Your Google Cloud project ID
  region      = var.gcp_location                    # The region where resources will be created
}

# The google-beta provider is used for features not yet available in the google provider
provider "google-beta" {
  credentials = file(var.gcp_credentials_file_path) # The service account key
  project     = var.gcp_project_id                  # Your Google Cloud project ID
  region      = var.gcp_location                    # The region where resources will be created
}

# # Vercel provider
# provider "vercel" {
#   api_token = var.vercel_api_token
# }

# Neon DB provider
provider "neon" {
  api_key = var.neon_api_key
}

# Hashicorp Random provider
provider "random" {}

# provider "mongodbatlas" {
#   public_key  = var.mongodb_atlas_public_key
#   private_key = var.mongodb_atlas_private_key
# }

# provider "auth0" {
#   domain    = var.auth0_domain
#   api_token = var.auth0_api_token
#   debug     = var.auth0_debug
# }

# provider "zitadel" {
#   domain   = var.zitadel_instance_domain
#   token    = var.zitadel_credentials_file_path
#   insecure = "false"
#   port     = "443"
# }

# data "google_service_account_access_token" "repo" {
#   target_service_account = local.service_account_email
#   scopes                 = ["cloud-platform"]
# }

# provider "docker" {
#   # Use a private registry and oauth2accesstoken (https://github.com/kreuzwerker/terraform-provider-docker/issues/189#issuecomment-900875286)
#   registry_auth {
#     address  = "${var.gcp_location}-docker.pkg.dev"
#     username = "oauth2accesstoken"
#     password = data.google_service_account_access_token.repo.access_token
#   }
# }

provider "unleash" {
  # Values created using project-setup.sh are placeholders for the first run. A second apply is needed to get the real value.
  api_url    = var.unleash_api_url
  auth_token = var.unleash_auth_token
}
