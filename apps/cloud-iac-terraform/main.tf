# This block sets up what backend should be used for Terraform. In this case, we are using Google Cloud Storage.
terraform {
  backend "gcs" {
    bucket      = "peerlab-386017-tfstate"
    prefix      = "environments/staging"
    credentials = "credentials.json" # The path to the JSON key file for the Service Account Terraform will use to manage its state
  }
}

# Configure the Google Cloud Provider for Terraform
provider "google" {
  credentials = file(var.credentials_path) # The service account key
  project     = var.project_id             # Your Google Cloud project ID
  region      = var.region                 # The region where resources will be created
}

# The google-beta provider is used for features not yet available in the google provider
provider "google-beta" {
  credentials = file(var.credentials_path) # The service account key
  project     = var.project_id             # Your Google Cloud project ID
  region      = var.region                 # The region where resources will be created
}

