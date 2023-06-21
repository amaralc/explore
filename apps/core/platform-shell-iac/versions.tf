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

    vercel = {
      source  = "vercel/vercel"
      version = "0.13.2"
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
  credentials = file(var.credentials_path)          # The service account key
  project     = var.gcp_management_shell_project_id # Your Google Cloud project ID
  region      = var.gcp_location                    # The region where resources will be created
}

# The google-beta provider is used for features not yet available in the google provider
provider "google-beta" {
  credentials = file(var.credentials_path)          # The service account key
  project     = var.gcp_management_shell_project_id # Your Google Cloud project ID
  region      = var.gcp_location                    # The region where resources will be created
}

# Vercel provider
provider "vercel" {
  api_token = var.vercel_api_token
}

# Neon DB provider
provider "neon" {
  api_key = var.neon_api_key
}

# Hashicorp Random provider
provider "random" {}


