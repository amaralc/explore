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

    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "1.10.2"
    }

    auth0 = {
      source  = "auth0/auth0"
      version = "1.0.0-beta.1"
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

provider "mongodbatlas" {
  public_key  = var.mongodb_atlas_public_key
  private_key = var.mongodb_atlas_private_key
}

provider "auth0" {
  domain    = var.auth0_domain
  api_token = var.auth0_api_token
  debug     = var.auth0_debug
}


