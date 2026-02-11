terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.19.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "7.19.0"
    }

    vercel = {
      source  = "vercel/vercel"
      version = "0.15.0"
    }

    neon = {
      source  = "kislerdm/neon"
      version = "0.13.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "3.8.1"
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

# Vercel provider
provider "vercel" {
  api_token = var.vercel_api_token
}

# Neon DB provider
provider "neon" {
  api_key = var.neon_api_key
}

