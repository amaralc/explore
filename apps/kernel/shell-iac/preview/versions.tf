terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.80.0" # Adjust the version to match the latest release
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "4.80.0" # Adjust the version to match the latest release
    }

    vercel = {
      source  = "vercel/vercel"
      version = "0.15.0"
    }

    neon = {
      source  = "kislerdm/neon"
      version = "0.1.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "3.5.1"
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
  # Check firebase options here: https://firebase.google.com/docs/projects/terraform/get-started
}

# Vercel provider
# provider "vercel" {
#   api_token = var.vercel_api_token
# }

# Neon DB provider
provider "neon" {
  api_key = var.neon_api_key
}

# Hashicorp Random provider
provider "random" {}


