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

# # The Vercel provider is only used in the terraform production environment since the module already deals with other environments by itself
# provider "vercel" {
#   api_token = var.vercel_api_token
# }
