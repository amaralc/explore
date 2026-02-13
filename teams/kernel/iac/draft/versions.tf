terraform {
  required_version = ">=0.13"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.19.0"
    }
  }
  provider_meta "google" {
    module_name = "blueprints/terraform/fs-exported/v0.1.0"
  }
}


