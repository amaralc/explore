terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.65.2" # Adjust the version to match the latest release
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "4.65.2" # Adjust the version to match the latest release
    }
  }
}


# Configure the Google Cloud Provider for Terraform
provider "google" {
  credentials = file(var.gcp_credentials_file_path) # The service account key
  project     = var.project_id                      # Your Google Cloud project ID
  region      = var.region                          # The region where resources will be created
}

# The google-beta provider is used for features not yet available in the google provider
provider "google-beta" {
  credentials = file(var.gcp_credentials_file_path) # The service account key
  project     = var.project_id                      # Your Google Cloud project ID
  region      = var.region                          # The region where resources will be created
}

